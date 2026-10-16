import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {DraxConfig} from '@drax/common-back';
import {UserSessionRoutes, UserSessionPermissions, LoadPermissions} from '@drax/identity-back';
import {TestSetup} from '../setup/TestSetup';
import UserServiceFactory from '../../src/factory/UserServiceFactory.js';
import IdentityConfig from '../../src/config/IdentityConfig.js';
import AuthUtils from '../../src/utils/AuthUtils.js';

const engine = process.env.REMEMBER_ME_TEST_DB_ENGINE === 'mongo' ? 'mongo' : 'sqlite';

describe(`Remember-me endpoints (${engine})`, () => {
    const setup = new TestSetup(engine);
    let password: string;
    const post = (url: string, payload: any, headers = {}) => setup.fastifyInstance.inject({method: 'POST', url, payload, headers});
    const login = (rememberMe?: any) => post('/api/auth/login', {
        username: setup.rootUserData.username, password,
        ...(rememberMe === undefined ? {} : {rememberMe})
    });
    const remembered = async () => {
        const response = await login(true);
        expect(response.statusCode).toBe(200);
        return response.json();
    };

    beforeAll(async () => {
        LoadPermissions(Object.values(UserSessionPermissions));
        await setup.setup();
        setup.fastifyInstance.register(UserSessionRoutes);
        password = setup.rootUserData.password;
    });
    beforeEach(() => {
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'true');
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, '2592000');
    });
    afterAll(async () => { await setup.dropAndClose(); });

    it('preserves the exact normal login shape with feature disabled, absent or opt-out', async () => {
        for (const flag of [undefined, 'false']) {
            DraxConfig.set(IdentityConfig.RememberMeEnabled, flag);
            const response = await login(true);
            expect(response.statusCode).toBe(200);
            expect(Object.keys(response.json())).toEqual(['accessToken']);
        }
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'true');
        for (const optIn of [undefined, false]) {
            const response = await login(optIn);
            expect(response.statusCode).toBe(200);
            expect(Object.keys(response.json())).toEqual(['accessToken']);
        }
    });

    it('rejects invalid credentials and invalid rememberMe types', async () => {
        expect((await post('/api/auth/login', {username: setup.rootUserData.username, password: 'wrong', rememberMe: true})).statusCode).toBe(401);
        for (const rememberMe of ['true', 1, {}, null]) {
            expect((await login(rememberMe)).statusCode).toBe(400);
        }
    });

    it('returns extended tokens only on opt-in, rotates and rejects replay', async () => {
        const first = await remembered();
        expect(Object.keys(first).sort()).toEqual(['accessToken', 'refreshExpiresAt', 'refreshToken']);
        expect(first.refreshToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
        const refreshed = await post('/api/auth/refresh', {refreshToken: first.refreshToken}, {authorization: 'Bearer expired-or-invalid'});
        expect(refreshed.statusCode).toBe(200);
        const second = refreshed.json();
        expect(second.refreshToken).not.toBe(first.refreshToken);
        expect(second.refreshExpiresAt).toBe(first.refreshExpiresAt);
        const me = await setup.me(second.accessToken);
        expect(me.username).toBe(setup.rootUserData.username);
        expect((await post('/api/auth/refresh', {refreshToken: first.refreshToken})).statusCode).toBe(401);
        const logout = await post('/api/auth/logout', {refreshToken: second.refreshToken}, {authorization: 'Bearer expired-or-invalid'});
        expect(logout.statusCode).toBe(200);
        expect(logout.json()).toEqual({success: true});
        expect((await post('/api/auth/logout', {refreshToken: second.refreshToken})).statusCode).toBe(200);
        expect((await post('/api/auth/refresh', {refreshToken: second.refreshToken})).statusCode).toBe(401);
    });

    it('makes concurrent refresh requests single-use', async () => {
        const first = await remembered();
        const results = await Promise.all([post('/api/auth/refresh', {refreshToken: first.refreshToken}), post('/api/auth/refresh', {refreshToken: first.refreshToken})]);
        expect(results.map(r => r.statusCode).sort()).toEqual([200, 401]);
    });

    it('validates refresh/logout bodies and does not reveal token existence at logout', async () => {
        for (const url of ['/api/auth/refresh', '/api/auth/logout']) {
            for (const payload of [{}, {refreshToken: null}, {refreshToken: 123}, {refreshToken: ''}, {refreshToken: {}}]) {
                expect((await post(url, payload)).statusCode).toBe(400);
            }
        }
        expect((await post('/api/auth/refresh', {refreshToken: 'unknown'})).statusCode).toBe(401);
        expect((await post('/api/auth/logout', {refreshToken: 'unknown'})).json()).toEqual({success: true});
    });

    it('stops refresh when disabled but still permits logout', async () => {
        const first = await remembered();
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'false');
        expect((await post('/api/auth/refresh', {refreshToken: first.refreshToken})).statusCode).toBe(401);
        expect((await post('/api/auth/logout', {refreshToken: first.refreshToken})).statusCode).toBe(200);
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'true');
        expect((await post('/api/auth/refresh', {refreshToken: first.refreshToken})).statusCode).toBe(401);
    });

    it('does not expose private refresh data through user/session CRUD', async () => {
        const first = await remembered();
        for (const url of ['/api/auth/me', '/api/users', '/api/users/search', '/api/user-sessions']) {
            const response = await setup.fastifyInstance.inject({method: 'GET', url, headers: {authorization: `Bearer ${first.accessToken}`}});

            expect(response.statusCode).toBe(200);
            expect(response.body).not.toMatch(/tokenHash|passwordFingerprint|refreshToken/);
            expect(response.body).not.toContain(first.refreshToken);
            if (url === '/api/user-sessions') {
                expect(response.body).toContain('"rememberMe":true');
                expect(response.body).toContain(first.refreshExpiresAt);
            }
        }
    });

    it('resets a switched tenant to the current DB assignment when refreshing', async () => {
        const first = await remembered();
        const switched = AuthUtils.switchTenant(first.accessToken, 'untrusted-tenant', 'untrusted');
        expect(AuthUtils.verifyToken(switched).tenantId).toBe('untrusted-tenant');
        const refreshed = await post('/api/auth/refresh', {refreshToken: first.refreshToken, tenantId: 'untrusted-tenant'});
        expect(refreshed.statusCode).toBe(200);
        const claims = AuthUtils.verifyToken(refreshed.json().accessToken);
        expect(claims.tenantId).toBe(setup.rootUser.tenant?._id?.toString() || null);
    });

    it('rejects expiration at the endpoint without extending the lifetime', async () => {
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, '60');
        const first = await remembered();
        vi.spyOn(Date, 'now').mockReturnValue(Date.parse(first.refreshExpiresAt));
        try {
            expect((await post('/api/auth/refresh', {refreshToken: first.refreshToken})).statusCode).toBe(401);
        } finally {
            vi.restoreAllMocks();
        }
    });

    it('reloads active status from the database before refresh', async () => {
        const first = await remembered();
        const users = UserServiceFactory()._repository;
        const id = setup.rootUser._id.toString();
        await users.updatePartial(id, {active: false, role: setup.adminRole._id.toString()});
        try {
            expect((await post('/api/auth/refresh', {refreshToken: first.refreshToken})).statusCode).toBe(401);
        } finally {
            await users.updatePartial(id, {active: true, role: setup.adminRole._id.toString()});
        }
    });

    it('reloads changed role assignments instead of retaining an elevated role', async () => {
        const first = await remembered();
        const users = UserServiceFactory()._repository;
        const id = setup.rootUser._id.toString();
        await users.updatePartial(id, {active: true, role: setup.restrictedRole._id.toString()});
        try {
            const refreshed = await post('/api/auth/refresh', {refreshToken: first.refreshToken});
            expect(refreshed.statusCode).toBe(200);
            expect(AuthUtils.verifyToken(refreshed.json().accessToken).roleId).toBe(setup.restrictedRole._id.toString());
        } finally {
            await users.updatePartial(id, {active: true, role: setup.adminRole._id.toString()});
        }
    });

    it('invalidates outstanding sessions after an administrative password change', async () => {
        const first = await remembered();
        const second = await remembered();
        const newPassword = 'RememberMeNewPassword321!';
        await UserServiceFactory().changeUserPassword(setup.rootUser._id.toString(), newPassword);
        password = newPassword;
        for (const token of [first.refreshToken, second.refreshToken]) {
            expect((await post('/api/auth/refresh', {refreshToken: token})).statusCode).toBe(401);
        }
        expect((await login(true)).statusCode).toBe(200);
    });

    it('invalidates outstanding sessions after changing own password', async () => {
        const first = await remembered();
        const next = 'RememberMeOwnPassword456!';
        await UserServiceFactory().changeOwnPassword(setup.rootUser._id.toString(), password, next);
        password = next;
        expect((await post('/api/auth/refresh', {refreshToken: first.refreshToken})).statusCode).toBe(401);
    });
});
