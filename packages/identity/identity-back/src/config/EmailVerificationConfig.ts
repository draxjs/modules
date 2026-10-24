import {DraxConfig} from '@drax/common-back';
import IdentityConfig from './IdentityConfig.js';

export function positiveVerificationSeconds(value: unknown, fallback: number, key: string): number {
    const seconds = value === undefined || value === null ? fallback :
        typeof value === 'number' || (typeof value === 'string' && value.trim() !== '') ? Number(value) : NaN;
    if (!Number.isSafeInteger(seconds) || seconds <= 0 ||
        !Number.isSafeInteger(Date.now() + seconds * 1000) || Date.now() + seconds * 1000 > 8640000000000000) {
        throw new Error(`${key} must be a positive integer within the date range`);
    }
    return seconds;
}

export function emailVerificationConfig() {
    return {
        ttl: positiveVerificationSeconds(DraxConfig.get(IdentityConfig.EmailVerificationTTLSeconds) ?? process.env[IdentityConfig.EmailVerificationTTLSeconds],
            86400, IdentityConfig.EmailVerificationTTLSeconds),
        cooldown: positiveVerificationSeconds(DraxConfig.get(IdentityConfig.EmailVerificationResendCooldownSeconds) ?? process.env[IdentityConfig.EmailVerificationResendCooldownSeconds],
            60, IdentityConfig.EmailVerificationResendCooldownSeconds),
    };
}
