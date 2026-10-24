import {afterEach, describe, expect, it} from 'vitest';
import {DraxConfig} from '@drax/common-back';
import IdentityConfig from '../../src/config/IdentityConfig.js';
import LoadIdentityConfigFromEnv from '../../src/setup/LoadIdentityConfigFromEnv.js';
import {emailVerificationConfig} from '../../src/config/EmailVerificationConfig.js';
import VerificationResendRateLimiter from '../../src/middleware/VerificationResendRateLimiter.js';

const keys = [IdentityConfig.EmailVerificationTTLSeconds, IdentityConfig.EmailVerificationResendCooldownSeconds];
const environment = new Map(keys.map(key => [key, process.env[key]]));
const config = {...DraxConfig.getAll()};

afterEach(() => {
    for (const [key, value] of environment) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
    for (const key of Object.keys(DraxConfig.getAll())) delete DraxConfig.getAll()[key];
    Object.assign(DraxConfig.getAll(), config);
});

describe('Email verification configuration', () => {
    it('loads defaults and replaces stale values when env is absent', () => {
        for (const key of keys) {
            delete process.env[key];
            DraxConfig.set(key, '7');
        }
        LoadIdentityConfigFromEnv();
        expect(emailVerificationConfig()).toEqual({ttl: 86400, cooldown: 60});
    });

    it('loads explicit positive integer seconds from env', () => {
        process.env[keys[0]] = '7200';
        process.env[keys[1]] = '30';
        LoadIdentityConfigFromEnv();
        expect(emailVerificationConfig()).toEqual({ttl: 7200, cooldown: 30});
    });

    it.each(keys)('rejects invalid environment and runtime values for %s', key => {
        for (const other of keys) delete process.env[other];
        for (const value of ['', ' ', '0', '-1', '1.5', 'NaN', 'Infinity', 'bad', '99999999999999999']) {
            process.env[key] = value;
            expect(() => LoadIdentityConfigFromEnv()).toThrow(`${key} must be a positive integer`);
            delete process.env[key];
            DraxConfig.set(key, value);
            expect(() => emailVerificationConfig()).toThrow(`${key} must be a positive integer`);
            DraxConfig.set(key, undefined);
        }
        for (const value of [true, false, [], {}]) {
            DraxConfig.set(key, value);
            expect(() => emailVerificationConfig()).toThrow(`${key} must be a positive integer`);
        }
    });
});

describe('Bounded resend IP rate limiter', () => {
    it('allows ten attempts, isolates IPs and resets at the fixed 15-minute boundary', () => {
        const limiter = new VerificationResendRateLimiter();
        for (let i = 0; i < 10; i++) expect(limiter.allow('one', 1000 + i)).toBe(true);
        expect(limiter.allow('one', 10000)).toBe(false);
        expect(limiter.allow('two', 10000)).toBe(true);
        expect(limiter.allow('one', 900999)).toBe(false);
        expect(limiter.allow('one', 901000)).toBe(true);
    });

    it('fails closed at capacity without evicting quotas and reclaims expired entries', () => {
        const limiter = new VerificationResendRateLimiter(1, 1000, 2);
        expect(limiter.allow('one', 0)).toBe(true);
        expect(limiter.allow('two', 1)).toBe(true);
        expect(limiter.allow('three', 2)).toBe(false);
        expect(limiter.allow('one', 3)).toBe(false);
        expect(limiter.allow('three', 1000)).toBe(true);
        expect(limiter.allow('two', 1000)).toBe(false);
        expect(limiter.allow('two', 1001)).toBe(true);
        expect((limiter as any).entries.size).toBe(2);
    });
});
