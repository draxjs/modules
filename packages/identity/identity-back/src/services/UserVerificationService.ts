import {randomBytes} from 'node:crypto';
import {ValidationError} from '@drax/common-back';
import type {IUserRepository} from '../interfaces/IUserRepository.js';
import {emailVerificationConfig} from '../config/EmailVerificationConfig.js';
import UserEmailService from './UserEmailService.js';

export default class UserVerificationService {
    constructor(private readonly users: IUserRepository) {}

    async send(email: string): Promise<boolean> {
        try {
            const {ttl, cooldown} = emailVerificationConfig();
            const now = Date.now();
            // Reserve before SMTP: failures also consume the cooldown, including across processes.
            const claim = await this.users.claimEmailVerification({
                email, now, expiresAt: now + ttl * 1000, cooldownBefore: now - cooldown * 1000,
                code: randomBytes(32).toString('base64url'),
            });
            if (!claim) return false;
            await UserEmailService.emailVerifyCode(claim.emailCode, claim.email);
            return true;
        } catch {
            // SMTP errors may contain credentials, recipients and the activation link. Never log them.
            console.warn('Email verification delivery deferred');
            return false;
        }
    }

    async verify(code: string): Promise<boolean> {
        if (typeof code !== 'string' || !code || !await this.users.consumeEmailVerification(code, Date.now())) {
            throw new ValidationError([{field: 'emailCode', reason: 'validation.notFound'}]);
        }
        return true;
    }
}
