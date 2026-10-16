import {describe, expect, it} from 'vitest';
import sqlite from 'better-sqlite3';
import {randomUUID} from 'node:crypto';
import {unlinkSync} from 'node:fs';
import RefreshTokenSqliteRepository from '../../src/repository/sqlite/RefreshTokenSqliteRepository.js';
import UserSessionSqliteRepository from '../../src/repository/sqlite/UserSessionSqliteRepository.js';

describe('Remember-me SQLite additive migration', () => {
    it('preserves legacy users/sessions, adds only informative session columns, and is repeatable', async () => {
        const file = `/tmp/drax-refresh-migration-${randomUUID()}.sqlite`;
        const db = new sqlite(file);
        let tokens: RefreshTokenSqliteRepository;
        let sessions: UserSessionSqliteRepository;
        try {
            db.exec(`CREATE TABLE users (_id TEXT PRIMARY KEY, username TEXT);
                INSERT INTO users VALUES ('user-1', 'legacy');
                CREATE TABLE user_sessions (_id TEXT PRIMARY KEY, uuid TEXT, user TEXT, userAgent TEXT, ip TEXT, createdAt TEXT, updatedAt TEXT);
                INSERT INTO user_sessions (_id, uuid, user) VALUES ('session-1', 'legacy-session', 'user-1');`);
            tokens = new RefreshTokenSqliteRepository(file);
            sessions = new UserSessionSqliteRepository(file);
            sessions.build();
            sessions.build();
            const legacy: any = db.prepare('SELECT * FROM user_sessions').get();
            expect(legacy.uuid).toBe('legacy-session');
            expect(legacy.rememberMe).toBeNull();
            expect(legacy.refreshExpiresAt).toBeNull();
            expect(Object.keys(legacy)).not.toContain('tokenHash');
            expect(Object.keys(legacy)).not.toContain('passwordFingerprint');
            expect(db.prepare('SELECT username FROM users').get()).toEqual({username: 'legacy'});
            await tokens.create({tokenHash: 'hashed-token', userId: 'user-1', session: 'legacy-session', passwordFingerprint: 'fingerprint', expiresAt: Date.now() + 10000});
            tokens.close();
            tokens = new RefreshTokenSqliteRepository(file);
            expect((await tokens.find('hashed-token'))?.userId).toBe('user-1');
            expect(db.prepare('SELECT count(*) AS count FROM user_sessions').get()).toEqual({count: 1});
        } finally {
            tokens?.close();
            (sessions as any)?.db.close();
            db.close();
            unlinkSync(file);
        }
    });
});
