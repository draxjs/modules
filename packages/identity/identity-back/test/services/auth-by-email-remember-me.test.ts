import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {COMMON, CommonConfig, DraxConfig} from '@drax/common-back';
import type {IUserCreate} from '@drax/identity-share';
import UserServiceFactory from '../../src/factory/UserServiceFactory.js';
import RoleServiceFactory from '../../src/factory/RoleServiceFactory.js';
import TenantServiceFactory from '../../src/factory/TenantServiceFactory.js';
import UserSessionServiceFactory from '../../src/factory/UserSessionServiceFactory.js';
import PasswordPolicyServiceFactory from '../../src/factory/PasswordPolicyServiceFactory.js';
import UserPasswordHistoryServiceFactory from '../../src/factory/UserPasswordHistoryServiceFactory.js';
import IdentityConfig from '../../src/config/IdentityConfig.js';
import PasswordPolicyConfig from '../../src/config/PasswordPolicyConfig.js';
import AuthUtils from '../../src/utils/AuthUtils.js';
import RefreshTokenSqliteRepository from '../../src/repository/sqlite/RefreshTokenSqliteRepository.js';
import RefreshTokenMongoRepository from '../../src/repository/mongo/RefreshTokenMongoRepository.js';
import MongoInMemory from '../setup/MongoInMemory.js';

const engine = process.env.REMEMBER_ME_TEST_DB_ENGINE === 'mongo' ? 'mongo' : 'sqlite';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

describe(`Email authentication remember-me workflow (${engine}, source services and real persistence)`, () => {
    const mongo = new MongoInMemory();
    const configBefore = {...DraxConfig.getAll()};
    const metadata = {userAgent: 'email-auth-test', ip: '127.0.0.1'};
    let directory: string;
    let service: ReturnType<typeof UserServiceFactory>;
    let tokens: RefreshTokenSqliteRepository | RefreshTokenMongoRepository;
    let role: string;
    let restrictedRole: string;
    let tenant: string;
    let nextTenant: string;
    let sequence = 0;
    const payload = (extra: Partial<IUserCreate> = {}): IUserCreate => {
        const id = ++sequence;
        return {name: 'Email User', username: `emailuser${id}`, email: `email${id}@example.test`,
            password: 'Email-Workflow-42!', active: true, role, tenant, ...extra};
    };
    const login = (data: IUserCreate, create = false, rememberMe?: boolean) =>
        service.authByEmail(data.email, create, {...data}, metadata, rememberMe);
    const createUser = async (data: IUserCreate) => service.create({...data});
    const profile = ({password, ...data}: IUserCreate) => data;
    const remembered = async (data: IUserCreate) => {
        const result = await login(data, false, true);
        expect(Object.keys(result).sort()).toEqual(['accessToken', 'refreshExpiresAt', 'refreshToken']);
        return result as Required<typeof result>;
    };

    beforeAll(async () => {
        directory = mkdtempSync(join(tmpdir(), 'drax-email-auth-'));
        const file = join(directory, 'identity.sqlite');
        DraxConfig.set(CommonConfig.DbEngine, engine === 'mongo' ? COMMON.DB_ENGINES.MONGODB : COMMON.DB_ENGINES.SQLITE);
        DraxConfig.set(CommonConfig.SqliteDbFile, file);
        DraxConfig.set(IdentityConfig.JwtSecret, 'email-workflow-tests-only');
        DraxConfig.set(IdentityConfig.JwtExpiration, '1h');
        for (const key of Object.values(PasswordPolicyConfig)) DraxConfig.set(key, undefined);
        if (engine === 'mongo') await mongo.connect();
        const roles = RoleServiceFactory();
        role = (await roles.create({name: 'EmailMember', permissions: []}))._id.toString();
        restrictedRole = (await roles.create({name: 'EmailRestricted', permissions: []}))._id.toString();
        const tenants = TenantServiceFactory();
        tenant = (await tenants.create({name: 'Email Company'}))._id.toString();
        nextTenant = (await tenants.create({name: 'Current Company'}))._id.toString();
        service = UserServiceFactory();
        tokens = engine === 'mongo' ? new RefreshTokenMongoRepository() : new RefreshTokenSqliteRepository(file);
    });
    beforeEach(() => {
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'true');
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, '60');
    });
    afterEach(() => vi.restoreAllMocks());
    afterAll(async () => {
        if (engine === 'mongo') await mongo.dropAndClose();
        // Source factories own independent SQLite connections, including population repositories.
        const visited = new Set<object>();
        const closeConnections = (value: any) => {
            if (!value || typeof value !== 'object' || visited.has(value)) return;
            visited.add(value);
            if (typeof value.close === 'function' && typeof value.prepare === 'function') {
                if (value.open) value.close();
                return;
            }
            for (const child of Object.values(value)) closeConnections(child);
        };
        if (service) for (const owner of [service, RoleServiceFactory(), TenantServiceFactory(),
            UserSessionServiceFactory(), PasswordPolicyServiceFactory(), UserPasswordHistoryServiceFactory(), tokens]) closeConnections(owner);
        if (directory) rmSync(directory, {recursive: true, force: true});
        for (const key of Object.keys(DraxConfig.getAll())) delete DraxConfig.getAll()[key];
        Object.assign(DraxConfig.getAll(), configBefore);
    });

    for (const existing of [true, false]) {
        describe(existing ? 'existing user' : 'new user', () => {
            it.each([
                {flag: 'true', optIn: undefined}, {flag: 'true', optIn: false},
                {flag: undefined, optIn: true}, {flag: 'false', optIn: true}
            ])('preserves access-token-only login with flag=$flag and optIn=$optIn', async ({flag, optIn}) => {
                const data = payload();
                if (existing) await createUser(data);
                DraxConfig.set(IdentityConfig.RememberMeEnabled, flag);
                const hydration = vi.spyOn(service._repository, 'findByIdWithPassword');
                const result = await login(data, !existing, optIn);
                expect(Object.keys(result)).toEqual(['accessToken']);
                expect(hydration).not.toHaveBeenCalled();
                const claims = AuthUtils.verifyToken(result.accessToken);
                expect(claims.roleId).toBe(role);
                expect(claims.tenantId).toBe(tenant);
            });

            it('hydrates the persisted hash and issues a refreshable session only on opt-in', async () => {
                const data = payload();
                if (existing) {
                    const created = await createUser(data);
                    expect(Object.hasOwn(created, 'password')).toBe(false);
                } else {
                    // Exercise external identities without a supplied password: generate, hash, persist, reload.
                    delete data.password;
                    delete data.active;
                }
                const hydration = vi.spyOn(service._repository, 'findByIdWithPassword');
                const result = await login(data, !existing, true);
                expect(Object.keys(result).sort()).toEqual(['accessToken', 'refreshExpiresAt', 'refreshToken']);
                expect(hydration).toHaveBeenCalledTimes(1);
                const claims = AuthUtils.verifyToken(result.accessToken);
                const stored = await tokens.find(digest(result.refreshToken!));
                const persisted = await service._repository.findByIdWithPassword(claims.id);
                expect(typeof persisted?.password === 'string' && persisted.password.startsWith('$2')).toBe(true);
                expect(stored?.passwordFingerprint === digest(persisted!.password)).toBe(true);
                expect(stored?.userId).toBe(claims.id);
                expect(stored?.session).toBe(claims.session);
                expect((await service.findByEmail(data.email))?.password).toBeUndefined();
                const refreshed = await service.refresh(result.refreshToken!);
                expect(AuthUtils.verifyToken(refreshed.accessToken).id).toBe(claims.id);
                expect(refreshed.refreshExpiresAt).toBe(result.refreshExpiresAt);
            });

            it.each([false, true])('rejects inactive users with rememberMe=%s', async optIn => {
                const data = payload({active: false});
                if (existing) await createUser(data);
                await expect(login(data, !existing, optIn)).rejects.toThrow('error.badCredentials');
            });
        });
    }

    it('does not create a missing user unless requested', async () => {
        const data = payload();
        await expect(login(data, false, true)).rejects.toThrow('error.badCredentials');
        expect(await service.findByEmail(data.email)).toBeNull();
    });

    it('does not overwrite an existing profile or assignments with external userData', async () => {
        const data = payload();
        const created = await createUser(data);
        const before = await service._repository.findByIdWithPassword(created._id.toString());
        const result = await login({...data, name: 'External Name', username: 'externalname', active: false,
            role: restrictedRole, tenant: nextTenant, password: 'Ignored-Password-55!'}, true, true);
        const after = await service._repository.findByIdWithPassword(created._id.toString());
        expect(after?.name).toBe(data.name);
        expect(after?.username).toBe(data.username);
        expect(after?.password === before?.password).toBe(true);
        expect(AuthUtils.verifyToken(result.accessToken)).toMatchObject({roleId: role, tenantId: tenant});
    });

    it.each(['inactive', 'assignments'])('rechecks persisted %s after sanitized email lookup', async change => {
        const data = payload();
        const created = await createUser(data);
        const lookup = service._repository.findByEmail.bind(service._repository);
        vi.spyOn(service._repository, 'findByEmail').mockImplementationOnce(async email => {
            const sanitized = await lookup(email);
            await service._repository.updatePartial(created._id.toString(), {...profile(data),
                active: change !== 'inactive', role: restrictedRole, tenant: nextTenant});
            return sanitized;
        });
        if (change === 'inactive') {
            await expect(login(data, false, true)).rejects.toThrow('error.badCredentials');
        } else {
            const result = await remembered(data);
            expect(AuthUtils.verifyToken(result.accessToken)).toMatchObject({roleId: restrictedRole, tenantId: nextTenant});
        }
    });

    it('rotates once, keeps absolute TTL, reloads current role/tenant and revokes on logout', async () => {
        const data = payload();
        const user = await createUser(data);
        const first = await remembered(data);
        const claims = AuthUtils.verifyToken(first.accessToken);
        await service._repository.updatePartial(user._id.toString(), {...profile(data), role: restrictedRole, tenant: nextTenant});
        vi.spyOn(Date, 'now').mockReturnValue(Date.parse(first.refreshExpiresAt) - 30000);
        const next = await service.refresh(first.refreshToken);
        expect(next.refreshToken !== first.refreshToken).toBe(true);
        expect(next.refreshExpiresAt).toBe(first.refreshExpiresAt);
        expect(AuthUtils.verifyToken(next.accessToken)).toMatchObject({roleId: restrictedRole,
            roleName: 'EmailRestricted', tenantId: nextTenant, tenantName: 'Current Company', session: claims.session});
        await expect(service.refresh(first.refreshToken)).rejects.toThrow('error.badCredentials');
        await service.logout(next.refreshToken);
        await expect(service.refresh(next.refreshToken)).rejects.toThrow('error.badCredentials');
        expect(await tokens.find(digest(next.refreshToken))).toBeNull();
    });

    it('rejects at the original absolute expiry after rotation', async () => {
        const data = payload();
        await createUser(data);
        const first = await remembered(data);
        const next = await service.refresh(first.refreshToken);
        vi.spyOn(Date, 'now').mockReturnValue(Date.parse(first.refreshExpiresAt));
        await expect(service.refresh(next.refreshToken)).rejects.toThrow('error.badCredentials');
    });

    it.each(['inactive', 'password'])('rejects and revokes when persisted %s changes', async change => {
        const data = payload();
        const user = await createUser(data);
        const first = await remembered(data);
        if (change === 'inactive') {
            await service._repository.updatePartial(user._id.toString(), {...profile(data), active: false});
        } else {
            await service.changeUserPassword(user._id.toString(), 'Changed-Email-Password-64!');
        }
        await expect(service.refresh(first.refreshToken)).rejects.toThrow('error.badCredentials');
        expect(await tokens.find(digest(first.refreshToken))).toBeNull();
    });
});
