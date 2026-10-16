// Private persistence contract. Never expose these records through identity CRUD.
interface IRefreshTokenRecord {
    tokenHash: string;
    userId: string;
    session: string;
    passwordFingerprint: string;
    expiresAt: number;
}

interface IRefreshTokenRepository {
    create(record: IRefreshTokenRecord): Promise<void>;
    find(tokenHash: string): Promise<IRefreshTokenRecord | null>;
    rotate(tokenHash: string, nextHash: string, now: number): Promise<boolean>;
    revoke(tokenHash: string): Promise<void>;
}

export type {IRefreshTokenRecord, IRefreshTokenRepository}
