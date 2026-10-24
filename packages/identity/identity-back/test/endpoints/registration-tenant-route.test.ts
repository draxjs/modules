import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import Fastify, {type FastifyInstance} from 'fastify';
import sqlite from 'better-sqlite3';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {COMMON, CommonConfig, DraxConfig} from '@drax/common-back';

import IdentityConfig from '../../src/config/IdentityConfig.js';
import PasswordPolicyConfig from '../../src/config/PasswordPolicyConfig.js';
import UserRoutes from '../../src/routes/UserRoutes.js';
import UserServiceFactory from '../../src/factory/UserServiceFactory.js';
import RoleServiceFactory from '../../src/factory/RoleServiceFactory.js';
import TenantServiceFactory from '../../src/factory/TenantServiceFactory.js';
import UserPasswordHistoryServiceFactory from '../../src/factory/UserPasswordHistoryServiceFactory.js';
import PasswordPolicyServiceFactory from '../../src/factory/PasswordPolicyServiceFactory.js';
import jwtMiddleware from '../../src/middleware/jwtMiddleware.js';
import rbacMiddleware from '../../src/middleware/rbacMiddleware.js';
import AuthUtils from '../../src/utils/AuthUtils.js';
import LoadIdentityConfigFromEnv from '../../src/setup/LoadIdentityConfigFromEnv.js';

const {sendEmail} = vi.hoisted(() => ({sendEmail: vi.fn()}));

// Keep layout generation and verification email logic real; never construct an SMTP transport.
vi.mock('@drax/email-back', async importOriginal => ({
    ...await importOriginal<typeof import('@drax/email-back')>(),
    EmailTransportServiceFactory: {get instance() { return {sendEmail}; }}
}));

describe('Registration tenant endpoints (source routes, Fastify and SQLite)', () => {
    let app: FastifyInstance;
    let db: ReturnType<typeof sqlite>;
    let directory: string;
    let defaultRoleId: string;
    let elevatedRoleId: string;
    let sequence = 0;
    let resendIp: string;
    let ipSequence = 0;
    const configBefore = {...DraxConfig.getAll()};
    const flag = IdentityConfig.RegistrationTenantEnabled;
    const envKeys = [flag, IdentityConfig.EmailVerificationTTLSeconds,
        IdentityConfig.EmailVerificationResendCooldownSeconds, ...Object.values(PasswordPolicyConfig)];
    const envBefore = new Map(envKeys.map(key => [key, process.env[key]]));
    const payload = (extra: Record<string, unknown> = {}) => {
        const id = ++sequence;
        return {name: 'Registration User', username: `registration-${id}`, email: `registration-${id}@example.test`,
            password: 'Local-Registration-42!', ...extra};
    };
    const register = (body: Record<string, unknown>, headers = {}) => app.inject({
        method: 'POST', url: '/api/users/register', payload: body, headers
    });
    const neutral = {success: true, message: 'If an account is pending verification, activation instructions will be sent.'};
    const resend = (email: unknown, extra = {}) => app.inject({method: 'POST',
        url: '/api/users/verification/resend', payload: {email}, remoteAddress: resendIp, ...extra});
    const stored = (email: string): any => db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const releaseCooldown = (email: string) => db.prepare('UPDATE users SET emailVerificationLastAttemptAt = 0 WHERE email = ?').run(email);
    const verify = (code: string) => app.inject({method: 'GET', url: `/api/users/verify-email/${code}`});
    const options = () => app.inject({method: 'GET', url: '/api/auth/registration-options'});
    const count = (table: 'users' | 'tenants' | 'user_password_history') =>
        (db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as {count: number}).count;
    const validation = (response: Awaited<ReturnType<typeof register>>, field: string, reason: string) => {
        expect(response.statusCode).toBe(422);
        expect(response.json()).toMatchObject({inputErrors: expect.arrayContaining([expect.objectContaining({field, reason})])});
    };

    beforeAll(async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        for (const key of envKeys) delete process.env[key];
        directory = mkdtempSync(join(tmpdir(), 'drax-registration-route-'));
        const file = join(directory, 'identity.sqlite');
        DraxConfig.set(CommonConfig.DbEngine, COMMON.DB_ENGINES.SQLITE);
        DraxConfig.set(CommonConfig.SqliteDbFile, file);
        DraxConfig.set(CommonConfig.BaseUrl, 'http://registration.example.test');
        DraxConfig.set(IdentityConfig.JwtSecret, 'registration-tests-only-local-secret');
        DraxConfig.set(IdentityConfig.JwtExpiration, '1h');
        DraxConfig.set(IdentityConfig.JwtIssuer, 'registration-tests');
        for (const key of Object.values(PasswordPolicyConfig)) DraxConfig.set(key, undefined);
        const roles = RoleServiceFactory();
        defaultRoleId = (await roles.create({name: 'RegistrationMember', permissions: []}))._id.toString();
        elevatedRoleId = (await roles.create({name: 'RegistrationAdmin', permissions: ['*', 'user:view', 'user:create', 'user:update']}))._id.toString();
        DraxConfig.set(IdentityConfig.defaultRole, 'RegistrationMember');
        TenantServiceFactory();
        // Zod emits draft-2020 metadata; the registration schema uses keywords supported by Fastify's AJV.
        // Disable only meta-schema validation, not request validation or additional-field sanitization.
        app = Fastify({logger: false, ajv: {customOptions: {validateSchema: false}}});
        app.addHook('onRequest', jwtMiddleware);
        app.addHook('onRequest', rbacMiddleware);
        app.register(UserRoutes);
        await app.ready();
        db = new sqlite(file);
    });

    beforeEach(() => {
        db.exec('DROP TRIGGER IF EXISTS reject_registration_history; DELETE FROM user_password_history; DELETE FROM users; DELETE FROM tenants;');
        delete process.env[flag];
        DraxConfig.set(flag, 'true');
        DraxConfig.set(IdentityConfig.EmailVerificationTTLSeconds, undefined);
        DraxConfig.set(IdentityConfig.EmailVerificationResendCooldownSeconds, undefined);
        sendEmail.mockReset().mockResolvedValue(undefined);
        vi.mocked(console.warn).mockClear();
        vi.mocked(console.error).mockClear();
        resendIp = `10.0.0.${++ipSequence}`;
    });

    afterEach(() => {
        db.exec('DROP TRIGGER IF EXISTS reject_registration_history');
    });

    afterAll(async () => {
        await app?.close();
        // Factories own several independent connections, including population repositories.
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
        for (const service of [UserServiceFactory(), RoleServiceFactory(), TenantServiceFactory(),
            UserPasswordHistoryServiceFactory(), PasswordPolicyServiceFactory()]) closeConnections(service);
        db?.close();
        if (directory) rmSync(directory, {recursive: true, force: true});
        for (const key of Object.keys(DraxConfig.getAll())) delete DraxConfig.getAll()[key];
        Object.assign(DraxConfig.getAll(), configBefore);
        for (const [key, value] of envBefore) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
        vi.restoreAllMocks();
    });

    it.each([undefined, 'false', 'true'])('exposes public options and applies flag %s', async value => {
        DraxConfig.set(flag, value);
        const response = await options();
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({tenantRequired: value === 'true'});
        const body = payload(value === 'true' ? {tenantName: 'Required Company'} : {});
        expect((await register(body)).statusCode).toBe(200);
        const user = await UserServiceFactory().findByUsername(body.username);
        expect(user).toBeTruthy();
        expect(count('tenants')).toBe(value === 'true' ? 1 : 0);
        expect(user.tenant == null).toBe(value !== 'true');
    });

    it.each([undefined, 'false'])('ignores tenantName entirely when flag is %s', async value => {
        DraxConfig.set(flag, value);
        const body = payload({tenantName: 'Not Created'});
        expect((await register(body)).statusCode).toBe(200);
        expect((await UserServiceFactory().findByUsername(body.username)).tenant).toBeNull();
        expect(count('tenants')).toBe(0);
    });

    it.each([undefined, '', '   ', '\t\n'])('requires a nonblank tenantName when enabled (%s)', async tenantName => {
        const body = payload(tenantName === undefined ? {} : {tenantName});
        validation(await register(body), 'tenantName', 'validation.required');
        expect(count('users')).toBe(0);
        expect(count('tenants')).toBe(0);
        expect(count('user_password_history')).toBe(0);
    });

    it('does not link a new registration to an existing tenant name', async () => {
        const tenant = await TenantServiceFactory().create({name: 'Existing Company'});
        const body = payload({tenantName: ' Existing Company '});
        validation(await register(body), 'tenantName', 'validation.unique');
        expect(await UserServiceFactory().findByUsername(body.username)).toBeNull();
        expect(count('users')).toBe(0);
        expect(count('tenants')).toBe(1);
        expect((await TenantServiceFactory().findById(tenant._id.toString())).name).toBe('Existing Company');
    });

    it('creates a trimmed tenant and persists the association, server role and inactive user', async () => {
        const body = payload({tenantName: '  New Company  '});
        const response = await register(body);
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({success: true, message: 'User registered successfully.', verificationEmailSent: true});
        const tenant = await TenantServiceFactory().findByName('New Company');
        const user = await UserServiceFactory().findByUsername(body.username);
        expect(user.tenant?._id.toString()).toBe(tenant._id.toString());
        expect(user.role?._id.toString()).toBe(defaultRoleId);
        expect(user.active).toBe(false);
        expect(user.origin).toBe('Registry');
        expect(count('users')).toBe(1);
        expect(count('tenants')).toBe(1);
        expect(count('user_password_history')).toBe(1);
    });

    it('allows exactly one winner for concurrent registrations using the same tenant name', async () => {
        const bodies = [payload({tenantName: 'Concurrent Company'}), payload({tenantName: 'Concurrent Company'})];
        const results = await Promise.all(bodies.map(body => register(body)));
        expect(results.map(result => result.statusCode).sort()).toEqual([200, 422]);
        const loser = results.findIndex(result => result.statusCode !== 200);
        validation(results[loser], 'tenantName', 'validation.unique');
        expect(await UserServiceFactory().findByUsername(bodies[loser].username)).toBeNull();
        const winner = await UserServiceFactory().findByUsername(bodies[1 - loser].username);
        const tenant = await TenantServiceFactory().findByName('Concurrent Company');
        expect(winner.tenant?._id.toString()).toBe(tenant._id.toString());
        expect(count('users')).toBe(1);
        expect(count('tenants')).toBe(1);
        expect(count('user_password_history')).toBe(1);
    });

    it.each(['username', 'email'] as const)('rolls back the new tenant on duplicate %s, preserving the original association', async field => {
        const original = payload({tenantName: 'Original Company'});
        expect((await register(original)).statusCode).toBe(200);
        const existing = await UserServiceFactory().findByUsername(original.username);
        const body = payload({tenantName: 'Rolled Back Company', [field]: original[field]});
        validation(await register(body), field, 'validation.unique');
        expect(await TenantServiceFactory().findByName('Rolled Back Company')).toBeFalsy();
        expect((await UserServiceFactory().findByUsername(original.username)).tenant?._id.toString())
            .toBe(existing.tenant?._id.toString());
        expect(count('users')).toBe(1);
        expect(count('tenants')).toBe(1);
        expect(count('user_password_history')).toBe(1);
    });

    it.each(['false', 'true'])('discards malicious server-owned fields with flag %s', async value => {
        DraxConfig.set(flag, value);
        const otherTenant = await TenantServiceFactory().create({name: 'Victim Company'});
        const body = payload({tenantName: 'Own Company', role: elevatedRoleId, tenant: otherTenant._id.toString(),
            tenantId: otherTenant._id.toString(), active: true, origin: 'Admin', emailVerified: true,
            phoneVerified: true, emailCode: 'attacker-code', phoneCode: 'attacker-code', groups: ['admin'],
                        emailCodeExpiresAt: 9999999999999, emailVerificationLastAttemptAt: 9999999999999});
        expect((await register(body)).statusCode).toBe(200);
        const user = await UserServiceFactory().findByUsername(body.username);
        expect(user.role?._id.toString()).toBe(defaultRoleId);
        expect(user.active).toBe(false);
        expect(user.origin).toBe('Registry');
        const stored = db.prepare('SELECT emailVerified, phoneVerified, emailCode, phoneCode, groups FROM users WHERE username = ?')
            .get(body.username) as Record<string, unknown>;
        expect(Boolean(stored.emailVerified)).toBe(false);
        expect(Boolean(stored.phoneVerified)).toBe(false);
        expect(stored.emailCode === 'attacker-code').toBe(false);
        expect(stored.phoneCode === 'attacker-code').toBe(false);
                expect(db.prepare('SELECT emailCodeExpiresAt - emailVerificationLastAttemptAt AS ttl FROM users WHERE username = ?')
                    .get(body.username)).toEqual({ttl: 86400000});
        expect(stored.groups == null || stored.groups === '').toBe(true);
        if (value === 'true') {
            const own = await TenantServiceFactory().findByName('Own Company');
            expect(user.tenant?._id.toString()).toBe(own._id.toString());
            expect(count('tenants')).toBe(2);
        } else {
            expect(user.tenant).toBeNull();
            expect(count('tenants')).toBe(1);
        }
    });

    it('keeps the tenant when user persistence succeeds but password history fails', async () => {
        db.exec(`CREATE TRIGGER reject_registration_history BEFORE INSERT ON user_password_history
            BEGIN SELECT RAISE(FAIL, 'registration history intentionally unavailable'); END`);
        const body = payload({tenantName: 'Persisted Company'});
        expect((await register(body)).statusCode).toBe(500);
        const user = await UserServiceFactory().findByUsername(body.username);
        const tenant = await TenantServiceFactory().findByName('Persisted Company');
        expect(user).toBeTruthy();
        expect(tenant).toBeTruthy();
        expect(user.tenant?._id.toString()).toBe(tenant._id.toString());
        expect(count('users')).toBe(1);
        expect(count('tenants')).toBe(1);
        expect(count('user_password_history')).toBe(0);
    });

    it('rejects authenticated registration but allows anonymous RBAC requests', async () => {
        const token = AuthUtils.generateToken({id: 'existing-user', username: 'existing-user',
            roleId: defaultRoleId, roleName: 'RegistrationMember', session: 'registration-test-session'});
        const response = await register(payload({tenantName: 'Forbidden Company'}), {authorization: `Bearer ${token}`});
        expect(response.statusCode).toBe(401);
        expect(count('users')).toBe(0);
        expect(count('tenants')).toBe(0);
        expect((await register(payload({tenantName: 'Anonymous Company'}))).statusCode).toBe(200);
    });

    it('keeps registration and tenant pending after SMTP failure, then recovers via resend without profile changes', async () => {
        const body = payload({tenantName: 'SMTP Pending Company'});
        sendEmail.mockImplementationOnce(async options => {
            throw new Error(`SMTP ${options.to} ${options.html} ${body.password} smtp-secret`);
        });
        const response = await register(body);
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({success: true, message: 'User registered successfully.', verificationEmailSent: false});
        const pending = stored(body.email);
        expect(pending).toMatchObject({active: 0, emailVerified: 0, origin: 'Registry'});
        expect(pending.emailCode).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(pending.emailCodeExpiresAt - pending.emailVerificationLastAttemptAt).toBe(86400000);
        expect(count('users')).toBe(1);
        expect(count('tenants')).toBe(1);
        expect(vi.mocked(console.warn).mock.calls).toEqual([['Email verification delivery deferred']]);
        expect(vi.mocked(console.error).mock.calls).toEqual([]);
        expect((await resend(body.email)).json()).toEqual(neutral);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        releaseCooldown(body.email);
        const before = stored(body.email);
        const tenantBefore = db.prepare('SELECT * FROM tenants').all();
        expect((await resend(body.email, {payload: {email: body.email, password: 'attack', name: 'attack',
            role: elevatedRoleId, tenant: 'attack', active: true, emailVerified: true}})).json()).toEqual(neutral);
        const {emailVerificationLastAttemptAt, ...after} = stored(body.email);
        const {emailVerificationLastAttemptAt: _, ...original} = before;
        expect(after).toEqual(original);
        expect(db.prepare('SELECT * FROM tenants').all()).toEqual(tenantBefore);
        expect(sendEmail).toHaveBeenCalledTimes(2);
        expect(sendEmail.mock.calls[1][0]).toMatchObject({to: body.email,
            html: expect.stringContaining(`/verify-email/${pending.emailCode}`)});
        expect((await verify(pending.emailCode)).statusCode).toBe(200);
        expect(stored(body.email)).toMatchObject({active: 1, emailVerified: 1, emailCode: null, emailCodeExpiresAt: null});
    });

    it('still returns duplicate email 422 after a failed delivery without another tenant or email', async () => {
        const body = payload({tenantName: 'First pending company'});
        sendEmail.mockRejectedValue(new Error('SMTP unavailable'));
        expect((await register(body)).json().verificationEmailSent).toBe(false);
        validation(await register(payload({email: body.email, tenantName: 'Duplicate company'})), 'email', 'validation.unique');
        expect(count('users')).toBe(1);
        expect(count('tenants')).toBe(1);
        expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it.each([
        {origin: 'Registry', emailVerified: 1, active: 1},
        {origin: 'Registry', emailVerified: 1, active: 0},
        {origin: 'Admin', emailVerified: 0, active: 0},
    ])('does not send or mutate an ineligible account (%j)', async state => {
        const body = payload({tenantName: 'Ineligible Company'});
        await register(body);
        db.prepare('UPDATE users SET origin = @origin, emailVerified = @emailVerified, active = @active, emailVerificationLastAttemptAt = 0 WHERE email = @email')
            .run({...state, email: body.email});
        const before = stored(body.email);
        sendEmail.mockClear();
        const response = await resend(body.email);
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual(neutral);
        expect(sendEmail).not.toHaveBeenCalled();
        expect(stored(body.email)).toEqual(before);
        expect((await verify(before.emailCode)).statusCode).toBe(422);
        expect(stored(body.email)).toEqual(before);
    });

    it('returns the neutral response for unknown and malformed emails without sending', async () => {
        for (const email of ['unknown@example.test', 'not-an-email', null, {}, 123]) {
            const response = await resend(email);
            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(neutral);
        }
        expect(sendEmail).not.toHaveBeenCalled();
        expect(count('users')).toBe(0);
    });

    it('claims just one email for concurrent resend requests from different IPs and keeps the same unexpired code', async () => {
        const body = payload({tenantName: 'Concurrent resend'});
        await register(body);
        const initial = stored(body.email);
        sendEmail.mockClear();
        releaseCooldown(body.email);
        const responses = await Promise.all(Array.from({length: 20}, (_, i) => resend(body.email, {remoteAddress: `10.1.0.${i}`})));
        for (const response of responses) {
            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(neutral);
        }
        expect(sendEmail).toHaveBeenCalledTimes(1);
        expect(stored(body.email)).toMatchObject({emailCode: initial.emailCode, emailCodeExpiresAt: initial.emailCodeExpiresAt});
        await resend(body.email);
        expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('keeps SMTP failures neutral and applies the persisted cooldown to failed attempts too', async () => {
        const body = payload({tenantName: 'Failed resend'});
        await register(body);
        releaseCooldown(body.email);
        sendEmail.mockClear().mockRejectedValue(new Error('SMTP secret recipient code'));
        const first = await resend(body.email);
        const second = await resend(body.email);
        expect(first.statusCode).toBe(200);
        expect(first.json()).toEqual(neutral);
        expect(second.json()).toEqual(neutral);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        expect(stored(body.email)).toMatchObject({active: 0, emailVerified: 0});
        expect(vi.mocked(console.warn).mock.calls).toEqual([['Email verification delivery deferred']]);
    });

    it.each(['expired', 'legacy'])('rejects a %s code, rotates it through resend and consumes the new code once', async mode => {
        const body = payload({tenantName: `Rotate ${mode}`});
        await register(body);
        const oldCode = stored(body.email).emailCode;
        db.prepare('UPDATE users SET emailCodeExpiresAt = ?, emailVerificationLastAttemptAt = 0 WHERE email = ?')
            .run(mode === 'legacy' ? null : Date.now() - 1, body.email);
        expect((await verify(oldCode)).statusCode).toBe(422);
        expect(stored(body.email).active).toBe(0);
        expect((await resend(body.email)).json()).toEqual(neutral);
        const renewed = stored(body.email);
        expect(renewed.emailCode).not.toBe(oldCode);
        expect(renewed.emailCodeExpiresAt).toBeGreaterThan(Date.now());
        expect((await verify(oldCode)).statusCode).toBe(422);
        const results = await Promise.all([verify(renewed.emailCode), verify(renewed.emailCode)]);
        expect(results.map(result => result.statusCode).sort()).toEqual([200, 422]);
        expect(stored(body.email)).toMatchObject({active: 1, emailVerified: 1, emailCode: null, emailCodeExpiresAt: null});
        const calls = sendEmail.mock.calls.length;
        releaseCooldown(body.email);
        expect((await resend(body.email)).json()).toEqual(neutral);
        expect(sendEmail).toHaveBeenCalledTimes(calls);
    });

    it('applies configured positive TTL and cooldown values', async () => {
        DraxConfig.set(IdentityConfig.EmailVerificationTTLSeconds, '120');
        DraxConfig.set(IdentityConfig.EmailVerificationResendCooldownSeconds, '2');
        const body = payload({tenantName: 'Configured timeouts'});
        await register(body);
        const row = stored(body.email);
        expect(row.emailCodeExpiresAt - row.emailVerificationLastAttemptAt).toBe(120000);
        expect((await resend(body.email)).json()).toEqual(neutral);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        db.prepare('UPDATE users SET emailVerificationLastAttemptAt = ? WHERE email = ?').run(Date.now() - 2001, body.email);
        await resend(body.email);
        expect(sendEmail).toHaveBeenCalledTimes(2);
    });

    it('limits each IP to 10 attempts per window, including unknown emails, with a neutral 200', async () => {
        const body = payload({tenantName: 'IP quota'});
        await register(body);
        sendEmail.mockClear();
        releaseCooldown(body.email);
        for (let i = 0; i < 10; i++) expect((await resend('unknown@example.test')).json()).toEqual(neutral);
        const blocked = await resend(body.email);
        expect(blocked.statusCode).toBe(200);
        expect(blocked.json()).toEqual(neutral);
        expect(sendEmail).not.toHaveBeenCalled();
        expect((await resend(body.email, {remoteAddress: '10.2.0.1'})).json()).toEqual(neutral);
        expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('treats absent Authorization as anonymous but still validates supplied bearer tokens', async () => {
        expect((await resend('unknown@example.test')).statusCode).toBe(200);
        const response = await resend('unknown@example.test', {headers: {authorization: 'Bearer invalid'}});
        expect(response.statusCode).toBe(401);
        expect(sendEmail).not.toHaveBeenCalled();
    });

    it('does not expose secrets through CRUD, me, registration or resend responses', async () => {
        const body = payload({tenantName: 'Hidden secrets'});
        const registered = await register(body);
        const row = stored(body.email);
        const token = AuthUtils.generateToken({id: row._id, username: row.username,
            roleId: elevatedRoleId, roleName: 'RegistrationAdmin', tenantId: row.tenant, session: 'secrets-test'});
        const headers = {authorization: `Bearer ${token}`};
        const crudPayload = {name: 'CRUD Secret Test', username: 'crud-secret-test', email: 'crud-secret@example.test',
            password: 'Local-CRUD-Password-42!', role: defaultRoleId, active: false, phone: ''};
        const created = await app.inject({method: 'POST', url: '/api/users', headers, payload: crudPayload});
        expect(created.statusCode).toBe(200);
        const updated = await app.inject({method: 'PUT', url: `/api/users/${created.json()._id}`, headers,
            payload: {...crudPayload, name: 'Updated CRUD Secret Test'}});
        const responses = [registered, await resend(body.email), created, updated,
            await app.inject({method: 'GET', url: '/api/auth/me', headers}),
            await app.inject({method: 'GET', url: '/api/users', headers}),
            await app.inject({method: 'GET', url: '/api/users/search?search=registration', headers})];
        for (const response of responses) {
            expect(response.statusCode).toBe(200);
            for (const secret of ['password', 'emailCode', 'emailCodeExpiresAt', 'emailVerificationLastAttemptAt', 'phoneCode', 'recoveryCode', row.emailCode, row.password]) {
                expect(response.body).not.toContain(secret);
            }
        }
        const service = UserServiceFactory();
        // Test aggregation projection at the service boundary: the generic CRUD route currently coerces
        // fields to an array while its controller expects a string (outside this feature).
        for (const field of ['password', 'emailCode', 'emailCodeExpiresAt', 'emailVerificationLastAttemptAt', 'phoneCode', 'recoveryCode']) {
            await expect(service.groupBy({fields: [field]})).rejects.toMatchObject({
                statusCode: 422, errors: [{field: 'fields', reason: 'validation.invalid'}],
            });
        }
        for (const user of [await service.findById(row._id), await service.findByEmail(body.email),
            await service.findByUsername(body.username)]) {
            expect(user).not.toHaveProperty('emailCode');
            expect(user).not.toHaveProperty('password');
            expect(user).not.toHaveProperty('emailCodeExpiresAt');
        }
        for (const user of [await service._repository.findByIdWithPassword(row._id),
            await service.findByUsernameWithPassword(body.username)]) {
            expect(user.password).toBe(row.password);
            expect(user).not.toHaveProperty('emailCode');
            expect(user).not.toHaveProperty('emailCodeExpiresAt');
        }
    });

    it('does not put activation URL credentials into automatic Fastify logs', async () => {
        const lines: string[] = [];
        const loggingApp = Fastify({logger: {level: 'info', stream: {write: (line: string) => { lines.push(line); }}},
            ajv: {customOptions: {validateSchema: false}}});
        loggingApp.addHook('onRequest', jwtMiddleware);
        loggingApp.addHook('onRequest', rbacMiddleware);
        loggingApp.register(UserRoutes);
        try {
            await loggingApp.ready();
            const response = await loggingApp.inject({method: 'GET', url: '/api/users/verify-email/secret-url-credential'});
            expect(response.statusCode).toBe(422);
            expect(lines.join('')).not.toContain('secret-url-credential');
        } finally {
            await loggingApp.close();
        }
    });

    it.each([undefined, 'false', 'true'])('loads the registration flag from env (%s), replacing stale config', async value => {
        const saved = {...DraxConfig.getAll()};
        try {
            DraxConfig.set(flag, value === 'true' ? 'false' : 'true');
            if (value === undefined) delete process.env[flag];
            else process.env[flag] = value;
            LoadIdentityConfigFromEnv();
            expect(DraxConfig.get(flag)).toBe(value);
            expect((await options()).json()).toEqual({tenantRequired: value === 'true'});
        } finally {
            for (const key of Object.keys(DraxConfig.getAll())) delete DraxConfig.getAll()[key];
            Object.assign(DraxConfig.getAll(), saved);
        }
    });
});
