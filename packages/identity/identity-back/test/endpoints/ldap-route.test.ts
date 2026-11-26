import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import Fastify, {type FastifyInstance} from 'fastify';
import sqlite from 'better-sqlite3';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {COMMON, CommonConfig, DraxConfig} from '@drax/common-back';
import {InvalidCredentialsError} from 'ldapts';
import UserRoutes from '../../src/routes/UserRoutes.js';
import UserServiceFactory from '../../src/factory/UserServiceFactory.js';
import RoleServiceFactory from '../../src/factory/RoleServiceFactory.js';
import jwtMiddleware from '../../src/middleware/jwtMiddleware.js';
import rbacMiddleware from '../../src/middleware/rbacMiddleware.js';
import IdentityConfig from '../../src/config/IdentityConfig.js';

const ldap = vi.hoisted(() => ({bind: vi.fn(), search: vi.fn(), unbind: vi.fn()}));
vi.mock('ldapts', async original => ({...await original<typeof import('ldapts')>(),
    Client: vi.fn(function () { return ldap; })}));

describe('Native LDAP login (source routes, real Drax services and SQLite)', () => {
    let app: FastifyInstance;
    let db: ReturnType<typeof sqlite>;
    let directory: string;
    let roleId: string;
    let defaultRoleId: string;
    let otherRoleId: string;
    const config = {...DraxConfig.getAll()};
    const directoryEntry = {
        dn: 'cn=ldap.user,ou=people,dc=example,dc=test', cn: 'ldap.user', mail: 'ldap@example.test', gidNumber: '1000'
    };
    const login = (username = 'ldap.user', password = 'Directory-Password-42!', rememberMe = false) => app.inject({
        method: 'POST', url: '/api/auth/login', payload: {username, password, rememberMe}
    });
    const raw = (username = 'ldap.user'): any => db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    beforeAll(async () => {
        directory = mkdtempSync(join(tmpdir(), 'drax-ldap-route-'));
        const file = join(directory, 'identity.sqlite');
        DraxConfig.set(CommonConfig.DbEngine, COMMON.DB_ENGINES.SQLITE);
        DraxConfig.set(CommonConfig.SqliteDbFile, file);
        DraxConfig.set(IdentityConfig.JwtSecret, 'ldap-tests-only-signing-secret');
        DraxConfig.set(IdentityConfig.JwtExpiration, '1h');
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, '60');
        roleId = (await RoleServiceFactory().create({name: 'Implementaciones', permissions: []}))._id.toString();
        defaultRoleId = (await RoleServiceFactory().create({name: 'Desarrollo', permissions: []}))._id.toString();
        otherRoleId = (await RoleServiceFactory().create({name: 'Restricted', permissions: []}))._id.toString();
        UserServiceFactory();
        db = new sqlite(file);
        app = Fastify({logger: false, ajv: {customOptions: {validateSchema: false}}});
        app.addHook('onRequest', jwtMiddleware);
        app.addHook('onRequest', rbacMiddleware);
        app.register(UserRoutes);
        await app.ready();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    beforeEach(() => {
        db.prepare('DELETE FROM users').run();
        for (const mock of Object.values(ldap)) mock.mockReset();
        ldap.bind.mockResolvedValue(undefined);
        ldap.unbind.mockResolvedValue(undefined);
        ldap.search.mockImplementation(async (_dn, options) => ({searchEntries: options.scope === 'base'
            ? [directoryEntry]
            : [{cn: 'Implementaciones'}]}));
        DraxConfig.set('DRAX_LDAP_ENABLED', 'true');
        DraxConfig.set('DRAX_LDAP_URL', 'ldap://127.0.0.1:389');
        DraxConfig.set('DRAX_LDAP_USERS_DN', 'ou=people,dc=example,dc=test');
        DraxConfig.set('DRAX_LDAP_GROUPS_DN', 'ou=group,dc=example,dc=test');
        DraxConfig.set('DRAX_LDAP_DEFAULT_ROLE', 'Desarrollo');
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'false');
    });
    afterAll(async () => {
        await app?.close();
        db?.close();
        if (directory) rmSync(directory, {recursive: true, force: true});
        vi.restoreAllMocks();
        for (const key of Object.keys(DraxConfig.getAll())) delete DraxConfig.getAll()[key];
        Object.assign(DraxConfig.getAll(), config);
    });

    it('provisions once with the role named by the LDAP group and without a password', async () => {
        const response = await login();
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({accessToken: expect.any(String)});
        const user = raw();
        expect(user).toMatchObject({origin: 'LDAP', password: null, role: roleId,
            ldapDn: 'cn=ldap.user,ou=people,dc=example,dc=test'});
        const me = await app.inject({url: '/api/auth/me', headers: {authorization: `Bearer ${response.json().accessToken}`}});
        expect(me.statusCode).toBe(200);
        expect(me.json().username).toBe('ldap.user');
        expect(JSON.stringify(me.json())).not.toContain('Directory-Password');
        expect((await login()).statusCode).toBe(200);
        expect(raw()._id).toBe(user._id);
    });

    it('preserves an existing ID and an administrator-assigned role', async () => {
        expect((await login()).statusCode).toBe(200);
        const id = raw()._id;
        db.prepare('UPDATE users SET role = ? WHERE _id = ?').run(otherRoleId, id);
        ldap.search.mockResolvedValueOnce({searchEntries: [directoryEntry]})
            .mockResolvedValueOnce({searchEntries: [{cn: 'OtherGroup'}]});
        expect((await login()).statusCode).toBe(200);
        expect(raw()).toMatchObject({_id: id, role: otherRoleId});
    });

    it('keeps an existing profile when LDAP has no mail but refuses a new incomplete account', async () => {
        expect((await login()).statusCode).toBe(200);
        ldap.search.mockImplementation(async (_dn, options) => ({searchEntries: options.scope === 'base'
            ? [{...directoryEntry, mail: undefined}]
            : [{cn: 'Implementaciones'}]}));
        expect((await login()).statusCode).toBe(200);
        expect(raw().email).toBe('ldap@example.test');
        db.prepare('DELETE FROM users').run();
        expect((await login()).statusCode).toBe(401);
        expect(raw()).toBeUndefined();
    });

    it('never falls back to an imported local password for a directory account', async () => {
        expect((await login()).statusCode).toBe(200);
        const {default: AuthUtils} = await import('../../src/utils/AuthUtils.js');
        db.prepare('UPDATE users SET password = ?').run(AuthUtils.hashPassword('Local-Password-42!'));
        ldap.bind.mockRejectedValue(new InvalidCredentialsError());
        expect((await login('ldap.user', 'Local-Password-42!')).statusCode).toBe(401);
        ldap.bind.mockRejectedValue(new Error('directory is down'));
        expect((await login('ldap.user', 'Local-Password-42!')).statusCode).toBe(503);
    });

    it('rejects disabled accounts and changed LDAP identity bindings', async () => {
        expect((await login()).statusCode).toBe(200);
        db.prepare('UPDATE users SET active = 0').run();
        expect((await login()).statusCode).toBe(401);
        db.prepare("UPDATE users SET active = 1, ldapDn = 'cn=someone-else,dc=example,dc=test'").run();
        expect((await login()).statusCode).toBe(401);
    });

    it('keeps explicit local accounts available without contacting the directory', async () => {
        await UserServiceFactory().create({name: 'Local Administrator', username: 'localadmin',
            email: 'local@example.test', password: 'Local-Password-42!', role: roleId, active: true, phone: '', origin: 'Admin'});
        ldap.bind.mockRejectedValue(new Error('unreachable'));
        expect((await login('localadmin', 'Local-Password-42!')).statusCode).toBe(200);
        expect((await login('localadmin', 'Directory-Password-42!')).statusCode).toBe(401);
        expect(ldap.bind).not.toHaveBeenCalled();
    });

    it('does not link by email or create an account after failed bind', async () => {
        ldap.bind.mockRejectedValueOnce(new InvalidCredentialsError());
        expect((await login()).statusCode).toBe(401);
        expect(raw()).toBeUndefined();
        await UserServiceFactory().create({name: 'Different Local Identity', username: 'different',
            email: 'ldap@example.test', password: 'Local-Password-42!', role: roleId, active: true, phone: ''});
        expect((await login()).statusCode).toBe(401);
        expect(raw()).toBeUndefined();
    });

    it('uses the configured default only when the primary group is absent', async () => {
        ldap.search.mockImplementation(async (_dn, options) => ({
            searchEntries: options.scope === 'base' ? [directoryEntry] : []
        }));
        DraxConfig.set('DRAX_LDAP_DEFAULT_ROLE', 'MissingRole');
        expect((await login()).statusCode).toBe(401);
        expect(raw()).toBeUndefined();
        DraxConfig.set('DRAX_LDAP_DEFAULT_ROLE', 'Desarrollo');
        expect((await login()).statusCode).toBe(200);
        expect(raw().role).toBe(defaultRoleId);
    });

    it.each([
        {scenario: 'the group has no matching role', groups: [{cn: 'MissingRole'}]},
        {scenario: 'several groups match', groups: [{cn: 'Implementaciones'}, {cn: 'Desarrollo'}]}
    ])(
        'rejects provisioning when $scenario',
        async ({groups}) => {
            ldap.search.mockImplementation(async (_dn, options) => ({
                searchEntries: options.scope === 'base' ? [directoryEntry] : groups
            }));
            expect((await login()).statusCode).toBe(401);
            expect(raw()).toBeUndefined();
        }
    );

    it('refuses password changes and recovery for LDAP accounts', async () => {
        expect((await login()).statusCode).toBe(200);
        const service = UserServiceFactory();
        const id = raw()._id;
        await expect(service.changeUserPassword(id, 'Replacement-Password-42!')).rejects.toBeDefined();
        await expect(service.changeOwnPassword(id, 'Directory-Password-42!', 'Replacement-Password-42!')).rejects.toBeDefined();
        await expect(service.recoveryCode('ldap@example.test')).rejects.toBeDefined();
        expect(raw().password).toBeNull();
    });

    it('uses the existing remember-me session and rotates refresh tokens without a local password', async () => {
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'true');
        const response = await login('ldap.user', 'Directory-Password-42!', true);
        expect(response.statusCode).toBe(200);
        expect(response.json().refreshToken).toEqual(expect.any(String));
        const rotated = await app.inject({method: 'POST', url: '/api/auth/refresh', payload: {refreshToken: response.json().refreshToken}});
        expect(rotated.statusCode).toBe(200);
        expect(rotated.json().refreshToken).not.toBe(response.json().refreshToken);
        expect(raw().password).toBeNull();
    });

    it('does not permit generic user writes or trusted email login to change the authentication source', async () => {
        expect((await login()).statusCode).toBe(200);
        const service = UserServiceFactory();
        const user = raw();
        const profile = {name: user.name, username: user.username, email: user.email, phone: '', role: roleId, active: true};
        await service.update(user._id, {...profile, origin: 'Admin', ldapDn: 'cn=attacker', password: 'Replacement-Password-42!'} as any);
        expect(raw()).toMatchObject({origin: 'LDAP', ldapDn: user.ldapDn, password: null});
        await service.updatePartial(user._id, {...profile, origin: 'Admin', ldapDn: 'cn=attacker', password: 'Replacement-Password-42!'} as any);
        expect(raw()).toMatchObject({origin: 'LDAP', ldapDn: user.ldapDn, password: null});
        await expect(service.updatePartial(user._id, {...profile, username: 'renamed'})).rejects.toBeDefined();
        await expect(service.authByEmail(user.email, false, profile as any, {userAgent: 'test', ip: '127.0.0.1'})).rejects.toBeDefined();
        await expect(service.create({...profile, username: 'newldap', email: 'newldap@example.test', origin: 'LDAP',
            ldapDn: 'cn=newldap', password: 'Replacement-Password-42!'})).rejects.toBeDefined();
    });

    it('rejects an imported recovery code and LDAP login after the integration is disabled', async () => {
        expect((await login()).statusCode).toBe(200);
        db.exec('ALTER TABLE users ADD COLUMN recoveryCode TEXT');
        db.prepare("UPDATE users SET recoveryCode = 'old-code'").run();
        await expect(UserServiceFactory().changeUserPasswordByCode('old-code', 'Replacement-Password-42!')).rejects.toBeDefined();
        DraxConfig.set('DRAX_LDAP_ENABLED', 'false');
        expect((await login()).statusCode).toBe(401);
        expect(raw().password).toBeNull();
    });
});
