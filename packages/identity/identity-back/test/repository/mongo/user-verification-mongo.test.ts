import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {MongoMemoryServer} from 'mongodb-memory-server';
import Fastify, {type FastifyInstance} from 'fastify';
import {COMMON, CommonConfig, DraxConfig, mongoose} from '@drax/common-back';
import IdentityConfig from '../../../src/config/IdentityConfig.js';
import PasswordPolicyConfig from '../../../src/config/PasswordPolicyConfig.js';
import UserRoutes from '../../../src/routes/UserRoutes.js';
import jwtMiddleware from '../../../src/middleware/jwtMiddleware.js';
import rbacMiddleware from '../../../src/middleware/rbacMiddleware.js';
import RoleServiceFactory from '../../../src/factory/RoleServiceFactory.js';
import UserServiceFactory from '../../../src/factory/UserServiceFactory.js';
import UserMongoRepository from '../../../src/repository/mongo/UserMongoRepository.js';
import {UserModel} from '../../../src/models/UserModel.js';

const {sendEmail} = vi.hoisted(() => ({sendEmail: vi.fn()}));
vi.mock('@drax/email-back', async importOriginal => ({
    ...await importOriginal<typeof import('@drax/email-back')>(),
    EmailTransportServiceFactory: {get instance() { return {sendEmail}; }},
}));

describe('Mongo verification (real repository, Fastify and transport-only mock)', () => {
    let server: MongoMemoryServer;
    let app: FastifyInstance;
    let roleId: string;
    let sequence = 0;
    const config = {...DraxConfig.getAll()};
    const keys = [IdentityConfig.EmailVerificationTTLSeconds, IdentityConfig.EmailVerificationResendCooldownSeconds,
        ...Object.values(PasswordPolicyConfig)];
    const environment = new Map(keys.map(key => [key, process.env[key]]));
    const users = new UserMongoRepository();
    const neutral = {success: true, message: 'If an account is pending verification, activation instructions will be sent.'};
    const payload = () => ({name: 'Mongo Pending', username: `mongopending${++sequence}`,
        email: `mongo${sequence}@example.test`, password: 'Local-Mongo-Password-42!', tenantName: `Mongo tenant ${sequence}`});
    const register = (body: any) => app.inject({method: 'POST', url: '/api/users/register', payload: body});
    const resend = (email: string, ip = '127.0.0.1') => app.inject({method: 'POST',
        url: '/api/users/verification/resend', payload: {email}, remoteAddress: ip});
    const raw = (email: string) => UserModel.collection.findOne({email});
    const release = (email: string) => UserModel.collection.updateOne({email}, {$set: {emailVerificationLastAttemptAt: 0}});

    beforeAll(async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        for (const key of keys) {
            delete process.env[key];
            DraxConfig.set(key, undefined);
        }
        server = await MongoMemoryServer.create();
        await mongoose.connect(server.getUri(), {dbName: 'verification-tests'});
        DraxConfig.set(CommonConfig.DbEngine, COMMON.DB_ENGINES.MONGODB);
        DraxConfig.set(CommonConfig.BaseUrl, 'http://mongo.example.test');
        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, 'true');
        roleId = (await RoleServiceFactory().create({name: 'MongoVerificationMember', permissions: []}))._id.toString();
        DraxConfig.set(IdentityConfig.defaultRole, 'MongoVerificationMember');
        app = Fastify({logger: false, ajv: {customOptions: {validateSchema: false}}});
        app.addHook('onRequest', jwtMiddleware);
        app.addHook('onRequest', rbacMiddleware);
        app.register(UserRoutes);
        await app.ready();
        await UserModel.init();
    });
    beforeEach(async () => {
        sendEmail.mockReset().mockResolvedValue(undefined);
        await UserModel.deleteMany({});
    });
    afterAll(async () => {
        await app?.close();
        if (mongoose.connection.readyState) {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
        }
        await server?.stop();
        for (const key of Object.keys(DraxConfig.getAll())) delete DraxConfig.getAll()[key];
        Object.assign(DraxConfig.getAll(), config);
        for (const [key, value] of environment) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
        vi.restoreAllMocks();
    });

    it('registers successfully with a valid claimed code even though Mongo create hides secrets', async () => {
        const created = await users.create({name: 'Hidden', username: 'hiddencreate', email: 'hidden@example.test',
            password: 'stored-secret', active: false, role: roleId, origin: 'Registry', emailVerified: false,
            emailCode: 'hidden-code'});
        for (const field of ['password', 'emailCode', 'emailCodeExpiresAt', 'emailVerificationLastAttemptAt']) {
            expect(created).not.toHaveProperty(field);
        }
        const body = payload();
        const response = await register(body);
        expect(response.statusCode).toBe(200);
        expect(response.json().verificationEmailSent).toBe(true);
        const row = await raw(body.email);
        expect(row.emailCode).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(row.emailCodeExpiresAt - row.emailVerificationLastAttemptAt).toBe(86400000);
        expect(sendEmail.mock.calls[0][0]).toMatchObject({to: body.email,
            html: expect.stringContaining(`/verify-email/${row.emailCode}`)});
        expect(sendEmail.mock.calls[0][0].html).not.toContain('/verify-email/undefined');
        expect(await UserServiceFactory().findByEmail(body.email)).not.toHaveProperty('emailCodeExpiresAt');
    });

    it('preserves user and tenant on SMTP failure, keeps duplicate 422 and recovers through resend', async () => {
        const body = payload();
        sendEmail.mockRejectedValueOnce(new Error('SMTP secret'));
        const response = await register(body);
        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchObject({success: true, verificationEmailSent: false});
        const row = await raw(body.email);
        expect(row.active).toBe(false);
        expect(row.emailVerified).toBe(false);
        expect(await mongoose.connection.collection('tenants').findOne({_id: row.tenant})).toBeTruthy();
        expect((await register({...payload(), email: body.email})).statusCode).toBe(422);
        expect((await resend(body.email)).json()).toEqual(neutral);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        await release(body.email);
        const before = await raw(body.email);
        expect((await resend(body.email)).json()).toEqual(neutral);
        expect(sendEmail).toHaveBeenCalledTimes(2);
        const after = await raw(body.email);
        expect(after.emailCode).toBe(row.emailCode);
        expect(after.emailCodeExpiresAt).toBe(row.emailCodeExpiresAt);
        delete before.emailVerificationLastAttemptAt;
        delete after.emailVerificationLastAttemptAt;
        expect(after).toEqual(before);
    });

    it('claims once across independent repositories, persists cooldown and consumes codes one time', async () => {
        const body = payload();
        await register(body);
        await release(body.email);
        sendEmail.mockClear();
        const results = await Promise.all(Array.from({length: 20}, (_, i) => resend(body.email, `10.0.0.${i}`)));
        for (const response of results) expect(response.json()).toEqual(neutral);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        const row = await raw(body.email);
        const second = new UserMongoRepository();
        expect(await second.claimEmailVerification({email: body.email, now: Date.now(), expiresAt: Date.now() + 86400000,
            cooldownBefore: Date.now() - 60000, code: 'not-used'})).toBeNull();
        const consumed = await Promise.all([users.consumeEmailVerification(row.emailCode, Date.now()),
            second.consumeEmailVerification(row.emailCode, Date.now())]);
        expect(consumed.sort()).toEqual([false, true]);
        const activated = await raw(body.email);
        expect(activated).toMatchObject({active: true, emailVerified: true});
        expect(activated).not.toHaveProperty('emailCode');
        expect(activated).not.toHaveProperty('emailCodeExpiresAt');
    });

    it.each(['expired', 'legacy'])('rejects %s verification and rotates only through resend', async mode => {
        const body = payload();
        await register(body);
        const row = await raw(body.email);
        await UserModel.collection.updateOne({email: body.email}, mode === 'legacy'
            ? {$unset: {emailCodeExpiresAt: ''}, $set: {emailVerificationLastAttemptAt: 0}}
            : {$set: {emailCodeExpiresAt: Date.now(), emailVerificationLastAttemptAt: 0}});
        expect(await users.consumeEmailVerification(row.emailCode, Date.now())).toBe(false);
        expect((await resend(body.email)).json()).toEqual(neutral);
        const renewed = await raw(body.email);
        expect(renewed.emailCode).not.toBe(row.emailCode);
        expect(renewed.emailCodeExpiresAt).toBeGreaterThan(Date.now());
        expect(await users.consumeEmailVerification(row.emailCode, Date.now())).toBe(false);
        expect(await users.consumeEmailVerification(renewed.emailCode, Date.now())).toBe(true);
    });

    it('does not send for unknown, verified, admin-created or administratively disabled verified accounts', async () => {
        for (const state of [{origin: 'Registry', emailVerified: true, active: true},
            {origin: 'Registry', emailVerified: true, active: false}, {origin: 'Admin', emailVerified: false, active: false}]) {
            const body = payload();
            await register(body);
            await UserModel.collection.updateOne({email: body.email}, {$set: {...state, emailVerificationLastAttemptAt: 0}});
            const before = await raw(body.email);
            sendEmail.mockClear();
            expect((await resend(body.email, `10.3.0.${sequence}`)).json()).toEqual(neutral);
            expect(await users.consumeEmailVerification(before.emailCode, Date.now())).toBe(false);
            expect(sendEmail).not.toHaveBeenCalled();
            expect(await raw(body.email)).toEqual(before);
        }
        expect((await resend('unknown@example.test')).json()).toEqual(neutral);
        expect(sendEmail).not.toHaveBeenCalled();
    });
});
