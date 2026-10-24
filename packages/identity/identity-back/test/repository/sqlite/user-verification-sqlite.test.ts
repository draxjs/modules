import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import sqlite from 'better-sqlite3';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import UserSqliteRepository from '../../../src/repository/sqlite/UserSqliteRepository.js';

describe('SQLite verification persistence and additive migration', () => {
    let directory: string;
    let file: string;
    let db: ReturnType<typeof sqlite>;
    let users: UserSqliteRepository;
    const connections: any[] = [];
    const repository = () => {
        const result = new UserSqliteRepository(file, true);
        connections.push((result as any).db, (result as any).roleRepository.db, (result as any).tenantRepository.db);
        return result;
    };
    const claim = (now = 100000, code = 'new-code') => ({email: 'pending@example.test', now,
        cooldownBefore: now - 60000, expiresAt: now + 86400000, code});
    const row = (): any => db.prepare('SELECT * FROM users').get();

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'drax-verification-migration-'));
        file = join(directory, 'identity.sqlite');
        db = new sqlite(file);
        db.exec(`CREATE TABLE users (_id TEXT PRIMARY KEY, username TEXT UNIQUE, email TEXT UNIQUE,
            password TEXT, active INTEGER, origin TEXT, emailVerified INTEGER, emailCode TEXT);
            INSERT INTO users VALUES ('legacy-id', 'legacy-user', 'pending@example.test', 'preserved-hash', 0, 'Registry', 0, 'legacy-code');`);
        users = repository();
        users.build();
    });
    afterEach(() => {
        for (const connection of connections.splice(0)) if (connection.open) connection.close();
        db.close();
        rmSync(directory, {recursive: true, force: true});
    });

    it('adds nullable columns without losing legacy data, is repeatable and survives reopening', async () => {
        const before = row();
        expect(before).toMatchObject({_id: 'legacy-id', username: 'legacy-user', email: 'pending@example.test',
            password: 'preserved-hash', active: 0, origin: 'Registry', emailVerified: 0, emailCode: 'legacy-code',
            emailCodeExpiresAt: null, emailVerificationLastAttemptAt: null});
        users.build();
        const reopened = repository();
        reopened.build();
        expect(row()).toEqual(before);
        expect(await reopened.consumeEmailVerification('legacy-code', 100000)).toBe(false);
        expect((await reopened.findByEmailCode('legacy-code'))?._id).toBe('legacy-id');
        expect(await reopened.findByEmailCode('unknown')).toBeNull();
        expect(await reopened.claimEmailVerification(claim())).toEqual({email: 'pending@example.test', emailCode: 'new-code'});
        expect(row().password).toBe('preserved-hash');
    });

    it('shares the cooldown and single claim across independent connections and restarts', async () => {
        const second = repository();
        second.build();
        const results = await Promise.all([users.claimEmailVerification(claim()), second.claimEmailVerification(claim(100000, 'loser'))]);
        expect(results.filter(Boolean)).toHaveLength(1);
        const reopened = repository();
        reopened.build();
        expect(await reopened.claimEmailVerification(claim(159999))).toBeNull();
        const before = row();
        expect(await reopened.claimEmailVerification(claim(160000, 'not-used'))).toEqual({email: 'pending@example.test', emailCode: before.emailCode});
        expect(row().emailCodeExpiresAt).toBe(before.emailCodeExpiresAt);
        expect(row().active).toBe(0);
    });

    it('rejects expiry at the exact boundary, rotates and atomically consumes once across connections', async () => {
        await users.claimEmailVerification(claim());
        const expires = row().emailCodeExpiresAt;
        expect(await users.consumeEmailVerification('new-code', expires)).toBe(false);
        expect(await users.claimEmailVerification(claim(expires, 'rotated-code'))).toEqual({email: 'pending@example.test', emailCode: 'rotated-code'});
        expect(await users.consumeEmailVerification('new-code', expires)).toBe(false);
        const second = repository();
        const results = await Promise.all([users.consumeEmailVerification('rotated-code', expires), second.consumeEmailVerification('rotated-code', expires)]);
        expect(results.sort()).toEqual([false, true]);
        expect(row()).toMatchObject({active: 1, emailVerified: 1, emailCode: null, emailCodeExpiresAt: null, password: 'preserved-hash'});
        expect(await second.claimEmailVerification(claim(expires + 60000))).toBeNull();
    });
});
