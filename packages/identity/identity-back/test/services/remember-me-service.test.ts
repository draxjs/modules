import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {createHash, randomUUID} from 'node:crypto';
import {unlinkSync} from 'node:fs';
import {DraxConfig} from '@drax/common-back';
import RefreshTokenService from '../../src/services/RefreshTokenService.js';
import RefreshTokenSqliteRepository from '../../src/repository/sqlite/RefreshTokenSqliteRepository.js';
import RefreshTokenMongoRepository from '../../src/repository/mongo/RefreshTokenMongoRepository.js';
import type {IRefreshTokenRepository} from '../../src/interfaces/IRefreshTokenRepository.js';
import type {IUserRepository} from '../../src/interfaces/IUserRepository.js';
import IdentityConfig from '../../src/config/IdentityConfig.js';
import AuthUtils from '../../src/utils/AuthUtils.js';
import MongoInMemory from '../setup/MongoInMemory';

const engine = process.env.REMEMBER_ME_TEST_DB_ENGINE === 'mongo' ? 'mongo' : 'sqlite';

describe(`Remember-me service (${engine})`, () => {
    const file = `/tmp/drax-refresh-${randomUUID()}.sqlite`;
    const mongo = new MongoInMemory();
    let repository: IRefreshTokenRepository;
    let service: RefreshTokenService;
    let user: any;
    const users = {findByIdWithPassword: async () => user ? structuredClone(user) : null} as IUserRepository;

    beforeAll(async () => {
        if (engine === 'mongo') await mongo.connect();
        repository = engine === 'mongo' ? new RefreshTokenMongoRepository() : new RefreshTokenSqliteRepository(file);
        service = new RefreshTokenService(repository, users);
        DraxConfig.set(IdentityConfig.JwtSecret, 'remember-me-tests');
    });
    beforeEach(() => {
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'true');
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, '2592000');
        user = {_id: randomUUID(), username: 'alice', active: true, password: 'password-hash',
            role: {_id: randomUUID(), name: 'operator'}, tenant: {_id: randomUUID(), name: 'assigned'}};
    });
    afterAll(async () => {
        if (repository instanceof RefreshTokenSqliteRepository) {
            repository.close();
            unlinkSync(file);
        }
        if (engine === 'mongo') await mongo.dropAndClose();
    });

    it('stores only a digest and rotates without extending absolute expiry', async () => {
        const issued = await service.issue(user, 'session');
        expect(issued.refreshToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(Date.parse(issued.refreshExpiresAt) - Date.now()).toBeGreaterThan(2591990000);
        const hash = createHash('sha256').update(issued.refreshToken).digest('hex');
        const stored = await repository.find(hash);
        expect(stored?.tokenHash).toBe(hash);
        expect(JSON.stringify(stored)).not.toContain(issued.refreshToken);
        expect(JSON.stringify(stored)).not.toContain(user.password);
        const refreshed = await service.refresh(issued.refreshToken);
        expect(refreshed.refreshToken).not.toBe(issued.refreshToken);
        expect(refreshed.refreshExpiresAt).toBe(issued.refreshExpiresAt);
        expect(AuthUtils.verifyToken(refreshed.accessToken).session).toBe('session');
        await expect(service.refresh(issued.refreshToken)).rejects.toThrow('error.badCredentials');
        expect(await repository.find(hash)).toBeNull();
    });

    it('allows exactly one concurrent rotation even with independent repository instances', async () => {
        const other = engine === 'mongo' ? new RefreshTokenMongoRepository() : new RefreshTokenSqliteRepository(file);
        try {
            const second = new RefreshTokenService(other, users);
            const issued = await service.issue(user, 'race');
            const results = await Promise.allSettled([service.refresh(issued.refreshToken), second.refresh(issued.refreshToken)]);
            expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
            expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
        } finally {
            if (other instanceof RefreshTokenSqliteRepository) other.close();
        }
    });

    it('supports persistent storage across new repository/service instances', async () => {
        const issued = await service.issue(user, 'persistent');
        const other = engine === 'mongo' ? new RefreshTokenMongoRepository() : new RefreshTokenSqliteRepository(file);
        try {
            const result = await new RefreshTokenService(other, users).refresh(issued.refreshToken);
            expect(result.refreshExpiresAt).toBe(issued.refreshExpiresAt);
        } finally {
            if (other instanceof RefreshTokenSqliteRepository) other.close();
        }
    });

    it('revokes idempotently and does not revoke unrelated sessions', async () => {
        const first = await service.issue(user, 'one');
        const second = await service.issue(user, 'two');
        await service.logout(first.refreshToken);
        await service.logout(first.refreshToken);
        await service.logout('unknown');
        await expect(service.refresh(first.refreshToken)).rejects.toThrow('error.badCredentials');
        expect((await service.refresh(second.refreshToken)).accessToken).toBeTruthy();
    });

    it.each(['inactive', 'deleted', 'password'])('rejects a fresh DB user that is %s', async change => {
        const issued = await service.issue(user, 'invalidated');
        if (change === 'inactive') user.active = false;
        if (change === 'deleted') user = null;
        if (change === 'password') user.password = 'new-password-hash';
        await expect(service.refresh(issued.refreshToken)).rejects.toThrow('error.badCredentials');
    });

    it('uses current DB role and tenant, not previous privileges or client claims', async () => {
        const issued = await service.issue(user, 'claims');
        user.role = {_id: randomUUID(), name: 'restricted'};
        user.tenant = null;
        const claims = AuthUtils.verifyToken((await service.refresh(issued.refreshToken)).accessToken);
        expect(claims.roleName).toBe('restricted');
        expect(claims.roleId).toBe(user.role._id);
        expect(claims.tenantId).toBeNull();
        expect(claims.tenantName).toBeNull();
    });

    it('rejects expired tokens and expiration during atomic rotation', async () => {
        const expired = 'a'.repeat(43);
        await repository.create({tokenHash: createHash('sha256').update(expired).digest('hex'), userId: user._id,
            session: 'expired', passwordFingerprint: 'expired-fingerprint', expiresAt: Date.now() - 1});
        await expect(service.refresh(expired)).rejects.toThrow('error.badCredentials');
        const issued = await service.issue(user, 'expires-at-cas');
        const hash = createHash('sha256').update(issued.refreshToken).digest('hex');
        expect(await repository.rotate(hash, 'next', Date.parse(issued.refreshExpiresAt))).toBe(false);
    });

    it('is disabled by default/false, rejects unknown/malformed tokens and permits logout while disabled', async () => {
        const issued = await service.issue(user, 'disabled');
        for (const value of [undefined, 'false', '1', 'TRUE']) {
            DraxConfig.set(IdentityConfig.RememberMeEnabled, value);
            expect(RefreshTokenService.enabled()).toBe(false);
            await expect(service.issue(user, 'disabled-issue')).rejects.toThrow('error.badCredentials');
            await expect(service.refresh(issued.refreshToken)).rejects.toThrow('error.badCredentials');
        }
        await service.logout(issued.refreshToken);
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'true');
        for (const token of [issued.refreshToken, 'b'.repeat(43), '', '{}', null]) {
            await expect(service.refresh(token as string)).rejects.toThrow('error.badCredentials');
        }
    });

    it.each(['0', '-1', 'Infinity', 'NaN', '1.5', '999999999999999999'])('rejects invalid TTL %s', async ttl => {
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, ttl);
        await expect(service.issue(user, 'bad-ttl')).rejects.toThrow('DRAX_REFRESH_TOKEN_TTL_SECONDS');
    });

    it('honors a configured finite TTL', async () => {
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, '60');
        const issued = await service.issue(user, 'configured');
        expect(Date.parse(issued.refreshExpiresAt) - Date.now()).toBeGreaterThan(59000);
        expect(Date.parse(issued.refreshExpiresAt) - Date.now()).toBeLessThanOrEqual(60000);
    });
});
