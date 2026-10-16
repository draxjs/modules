import sqlite from "better-sqlite3";
import type {IRefreshTokenRecord, IRefreshTokenRepository} from "../../interfaces/IRefreshTokenRepository.js";

class RefreshTokenSqliteRepository implements IRefreshTokenRepository {
    private db: InstanceType<typeof sqlite>;

    constructor(dbFile: string) {
        this.db = new sqlite(dbFile);
        // Additive, idempotent migration: existing users/sessions need no changes.
        this.db.exec(`CREATE TABLE IF NOT EXISTS identity_refresh_tokens (
            tokenHash TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            session TEXT NOT NULL,
            passwordFingerprint TEXT NOT NULL,
            expiresAt INTEGER NOT NULL
        )`);
    }

    async create(record: IRefreshTokenRecord): Promise<void> {
        this.db.prepare(`INSERT INTO identity_refresh_tokens
            (tokenHash, userId, session, passwordFingerprint, expiresAt) VALUES (?, ?, ?, ?, ?)`)
            .run(record.tokenHash, record.userId, record.session, record.passwordFingerprint, record.expiresAt);
    }

    async find(tokenHash: string): Promise<IRefreshTokenRecord | null> {
        return this.db.prepare('SELECT * FROM identity_refresh_tokens WHERE tokenHash = ?').get(tokenHash) as IRefreshTokenRecord || null;
    }

    async rotate(tokenHash: string, nextHash: string, now: number): Promise<boolean> {
        return this.db.prepare(`UPDATE identity_refresh_tokens SET tokenHash = ?
            WHERE tokenHash = ? AND expiresAt > ?`).run(nextHash, tokenHash, now).changes === 1;
    }

    async revoke(tokenHash: string): Promise<void> {
        this.db.prepare('DELETE FROM identity_refresh_tokens WHERE tokenHash = ?').run(tokenHash);
    }

    close() {
        this.db.close();
    }
}

export default RefreshTokenSqliteRepository;
