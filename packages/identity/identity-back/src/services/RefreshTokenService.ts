import {createHash, randomBytes} from 'node:crypto';
import {DraxConfig} from '@drax/common-back';
import type {IUser} from '@drax/identity-share';
import type {IRefreshTokenRepository} from '../interfaces/IRefreshTokenRepository.js';
import type {IUserRepository} from '../interfaces/IUserRepository.js';
import IdentityConfig from '../config/IdentityConfig.js';
import BadCredentialsError from '../errors/BadCredentialsError.js';
import AuthUtils from '../utils/AuthUtils.js';

class RefreshTokenService {
    constructor(private repository: IRefreshTokenRepository, private users: IUserRepository) {}

    static enabled(): boolean {
        const value = DraxConfig.getOrLoad(IdentityConfig.RememberMeEnabled);
        return value === true || value === 'true';
    }

    private hash(value: string): string {
        return createHash('sha256').update(value).digest('hex');
    }

    private validToken(value: unknown): value is string {
        return typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
    }

    async issue(user: IUser, session: string) {
        if (!RefreshTokenService.enabled()) throw new BadCredentialsError();
        const configured = DraxConfig.getOrLoad(IdentityConfig.RefreshTokenTTLSeconds);
        const ttl = configured === undefined || configured === null || configured === '' ? 2592000 : Number(configured);
        const expiresAt = Date.now() + ttl * 1000;
        if (!Number.isSafeInteger(ttl) || ttl <= 0 || !Number.isSafeInteger(expiresAt) || expiresAt > 8640000000000000) {
            throw new Error('DRAX_REFRESH_TOKEN_TTL_SECONDS must be a positive finite integer within the date range');
        }
        const refreshToken = randomBytes(32).toString('base64url');
        await this.repository.create({
            tokenHash: this.hash(refreshToken), userId: user._id.toString(), session,
            // Binding to the current password hash also covers password writes outside UserService.
            passwordFingerprint: this.hash(user.password), expiresAt
        });
        return {refreshToken, refreshExpiresAt: new Date(expiresAt).toISOString()};
    }

    async refresh(refreshToken: string) {
        if (!RefreshTokenService.enabled() || !this.validToken(refreshToken)) throw new BadCredentialsError();
        const tokenHash = this.hash(refreshToken);
        const record = await this.repository.find(tokenHash);
        if (!record || record.expiresAt <= Date.now()) throw new BadCredentialsError();
        const user = await this.users.findByIdWithPassword(record.userId);
        if (!user || !user.active || !user.role?._id || !user.password || this.hash(user.password) !== record.passwordFingerprint) {
            await this.repository.revoke(tokenHash);
            throw new BadCredentialsError();
        }
        // Never trust client claims or a previously switched tenant. Use the current DB assignment.
        const accessToken = AuthUtils.generateToken({
            id: user._id.toString(), username: user.username,
            roleId: user.role?._id?.toString(), roleName: user.role?.name,
            tenantId: user.tenant?._id?.toString() || null, tenantName: user.tenant?.name || null,
            session: record.session
        });
        const nextToken = randomBytes(32).toString('base64url');
        if (!await this.repository.rotate(tokenHash, this.hash(nextToken), Date.now())) throw new BadCredentialsError();
        return {accessToken, refreshToken: nextToken, refreshExpiresAt: new Date(record.expiresAt).toISOString()};
    }

    async logout(refreshToken: string): Promise<void> {
        // Revocation remains possible after disabling issuance/refresh.
        if (this.validToken(refreshToken)) await this.repository.revoke(this.hash(refreshToken));
    }
}

export default RefreshTokenService;
