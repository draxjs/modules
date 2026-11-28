import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import Fastify, {type FastifyInstance} from 'fastify';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {COMMON, CommonConfig, DraxConfig, mongoose} from '@drax/common-back';
import {MongoMemoryServer} from 'mongodb-memory-server';
import sqlite from 'better-sqlite3';
import UserRoutes from '../../src/routes/UserRoutes.js';
import UserServiceFactory from '../../src/factory/UserServiceFactory.js';
import RoleServiceFactory from '../../src/factory/RoleServiceFactory.js';
import IdentityConfig from '../../src/config/IdentityConfig.js';
import jwtMiddleware from '../../src/middleware/jwtMiddleware.js';
import rbacMiddleware from '../../src/middleware/rbacMiddleware.js';
import {UserModel} from '../../src/models/UserModel.js';
import LdapService from '../../src/services/LdapService.js';

describe(`Real LDAP login with ${process.env.LDAP_TEST_DB_ENGINE}`, () => {
    let app: FastifyInstance;
    let base: string;
    let mongo: MongoMemoryServer;
    let db: ReturnType<typeof sqlite>;
    let directory: string;
    let roleId: string;
    let defaultRoleId: string;
    const engine = process.env.LDAP_TEST_DB_ENGINE;
    const request = async (path: string, body: unknown) => {
        const response = await fetch(`${base}${path}`, {method: 'POST',
            headers: {'content-type': 'application/json'}, body: JSON.stringify(body)});
        return {status: response.status, body: await response.json()};
    };
    const login = (username = 'ldap.user', password = 'Directory-Test-Only-42!', rememberMe = false) =>
        request('/api/auth/login', {username, password, rememberMe});
    const raw = async (username = 'ldap.user'): Promise<any> => engine === 'mongo'
        ? UserModel.collection.findOne({username}) : db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    const resetTransport = () => {
        DraxConfig.set('DRAX_LDAP_URL', process.env.LDAP_TEST_URL);
        DraxConfig.set('DRAX_LDAP_STARTTLS', 'false');
    };

    beforeAll(async () => {
        if (!process.env.LDAP_TEST_URL || !process.env.LDAP_TEST_TLS_URL || !['mongo', 'sqlite'].includes(engine)) {
            throw new Error('Run npm run testLdapIntegration to provision the isolated LDAP fixture');
        }
        vi.spyOn(console, 'error').mockImplementation(() => {});
        directory = mkdtempSync(join(tmpdir(), 'drax-ldap-real-'));
        const file = join(directory, 'identity.sqlite');
        DraxConfig.set(CommonConfig.DbEngine, engine);
        DraxConfig.set(CommonConfig.SqliteDbFile, file);
        DraxConfig.set(IdentityConfig.JwtSecret, 'ldap-integration-signing-key');
        DraxConfig.set(IdentityConfig.JwtExpiration, '1h');
        DraxConfig.set(IdentityConfig.RememberMeEnabled, 'true');
        if (engine === 'mongo') {
            mongo = await MongoMemoryServer.create();
            await mongoose.connect(mongo.getUri(), {dbName: 'drax-ldap-integration'});
        }
        roleId = (await RoleServiceFactory().create({name: 'Implementaciones', permissions: []}))._id.toString();
        defaultRoleId = (await RoleServiceFactory().create({name: 'Desarrollo', permissions: []}))._id.toString();
        UserServiceFactory();
        if (engine === 'mongo') await UserModel.init();
        else db = new sqlite(file);
        DraxConfig.set('DRAX_LDAP_ENABLED', 'true');
        DraxConfig.set('DRAX_LDAP_USERS_DN', 'ou=people,dc=example,dc=test');
        DraxConfig.set('DRAX_LDAP_GROUPS_DN', 'ou=group,dc=example,dc=test');
        resetTransport();
        app = Fastify({logger: false, ajv: {customOptions: {validateSchema: false}}});
        app.addHook('onRequest', jwtMiddleware);
        app.addHook('onRequest', rbacMiddleware);
        app.register(UserRoutes);
        base = await app.listen({port: 0, host: '127.0.0.1'});
    });
    afterAll(async () => {
        await app?.close();
        db?.close();
        if (mongo) { await mongoose.disconnect(); await mongo.stop(); }
        if (directory) rmSync(directory, {recursive: true, force: true});
        vi.restoreAllMocks();
    });

    it('reads the authenticated identity and its primary group from the real directory', async () => {
        expect(await new LdapService().authenticate('ldap.user', 'Directory-Test-Only-42!')).toMatchObject({
            username: 'ldap.user', email: 'ldap.user@example.test', groupName: 'Implementaciones'
        });
    });

    it('binds, provisions, issues a usable JWT and refreshes without persisting a directory password', async () => {
        const result = await login('ldap.user', 'Directory-Test-Only-42!', true);
        expect(result.status).toBe(200);
        const user = await raw();
        expect(user.origin).toBe('LDAP');
        expect(user.password == null).toBe(true);
        expect(user.role.toString()).toBe(roleId);
        expect(user.ldapDn).toBe('cn=ldap.user,ou=people,dc=example,dc=test');
        const response = await fetch(`${base}/api/auth/me`, {headers: {authorization: `Bearer ${result.body.accessToken}`}});
        expect(response.status).toBe(200);
        expect((await response.json()).username).toBe('ldap.user');
        expect((await request('/api/auth/refresh', {refreshToken: result.body.refreshToken})).status).toBe(200);
        expect((await login('LDAP.USER')).status).toBe(200);
        expect((await raw())._id.toString()).toBe(user._id.toString());
    });

    it('authenticates a username containing an escaped DN separator', async () => {
        expect((await login('alice,admin')).status).toBe(200);
        expect((await raw('alice,admin')).ldapDn).toBe('cn=alice\\2Cadmin,ou=people,dc=example,dc=test');
    });

    it('provisions with Desarrollo when the directory has no matching primary group', async () => {
        expect((await login('no-group')).status).toBe(200);
        expect((await raw('no-group')).role.toString()).toBe(defaultRoleId);
    });

    it('rejects wrong credentials, missing users and filter injection', async () => {
        for (const [username, password] of [['ldap.user', 'wrong'], ['missing', 'wrong'],
            ['*)(cn=*)', 'Directory-Test-Only-42!']]) {
            expect((await login(username, password)).status).toBe(401);
        }
    });

    it('uses StartTLS with a trusted fixture CA and preserves the existing identity', async () => {
        DraxConfig.set('DRAX_LDAP_STARTTLS', 'true');
        expect((await login()).status).toBe(200);
        resetTransport();
    });

    it('uses LDAPS with certificate validation enabled', async () => {
        DraxConfig.set('DRAX_LDAP_URL', process.env.LDAP_TEST_TLS_URL);
        expect((await login()).status).toBe(200);
        resetTransport();
    });

    it('reports an unavailable directory without local fallback or upstream disclosure', async () => {
        DraxConfig.set('DRAX_LDAP_URL', 'ldap://127.0.0.1:1');
        const result = await login();
        expect(result.status).toBe(503);
        expect(result.body.message).toBe('error.ldapUnavailable');
        expect(JSON.stringify(result.body)).not.toContain('Directory-Test-Only');
        resetTransport();
    });

    it('keeps administrator-assigned roles and refuses locally disabled users', async () => {
        const user = await raw();
        const role = await RoleServiceFactory().create({name: 'Restricted', permissions: []});
        const profile = {name: user.name, username: user.username, email: user.email, phone: '',
            active: true, role: role._id.toString(), origin: 'Admin', ldapDn: 'cn=attacker'};
        await UserServiceFactory().update(user._id.toString(), {...profile});
        expect((await login()).status).toBe(200);
        const updated = await raw();
        expect(updated._id.toString()).toBe(user._id.toString());
        expect(updated.role.toString()).toBe(role._id.toString());
        expect(updated.origin).toBe('LDAP');
        expect(updated.ldapDn).toBe(user.ldapDn);
        await UserServiceFactory().update(user._id.toString(), {...profile, active: false});
        expect((await login()).status).toBe(401);
    });
});
