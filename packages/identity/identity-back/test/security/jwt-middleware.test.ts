import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import Fastify from 'fastify';
import jsonwebtoken from 'jsonwebtoken';
import {DraxConfig} from '@drax/common-back';
import IdentityConfig from '../../src/config/IdentityConfig.js';
import jwtMiddleware from '../../src/middleware/jwtMiddleware.js';

const secret = 'jwt-middleware-test-secret';
const claims = {id: 'user-1', username: 'member', roleId: 'role-1', session: 'session-1'};
const valid = jsonwebtoken.sign(claims, secret, {expiresIn: '1h'});
const expired = jsonwebtoken.sign(claims, secret, {expiresIn: -1});

describe('JWT route policy (real Fastify onRequest hook)', () => {
    const app = Fastify();
    let externalChecks = 0;
    let protectedCalls = 0;
    let previousSecret: unknown;

    const identity = (request) => ({authUser: request.authUser ?? null, token: request.token ?? null});
    const get = (url: string, token?: string) => app.inject({
        method: 'GET', url, headers: token === undefined ? {} : {authorization: `Bearer ${token}`}
    });

    beforeAll(async () => {
        previousSecret = DraxConfig.getOrLoad(IdentityConfig.JwtSecret);
        DraxConfig.set(IdentityConfig.JwtSecret, secret);
        app.addHook('onRequest', jwtMiddleware);
        app.get('/public', identity);
        app.get('/optional', {config: {identityJwt: 'optional'}}, identity);
        app.get('/ignore/:id', {config: {identityJwt: 'ignore'}}, identity);
        app.get('/external', {
            config: {identityJwt: 'ignore'},
            preHandler: async (request, reply) => {
                externalChecks++;
                // Stand-in for the consumer's independent credential verifier, not Drax JWT.
                if (request.headers.authorization !== 'Bearer external-valid') {
                    return reply.code(401).send({error: 'External credential rejected'});
                }
            }
        }, identity);
        app.get('/protected', {
            preHandler: async (request, reply) => {
                if (!(request as any).authUser) return reply.code(401).send({error: 'Authentication required'});
            }
        }, (request) => { protectedCalls++; return identity(request); });
        for (const url of ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']) {
            app.post(url, identity);
        }
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
        DraxConfig.set(IdentityConfig.JwtSecret, previousSecret);
    });

    it('allows anonymous public requests, but does not ignore an invalid Bearer by default', async () => {
        expect((await get('/public')).json()).toEqual({authUser: null, token: null});
        const response = await get('/public', 'invalid');
        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({error: 'Token JWT inválido'});
    });

    it('optional validates supplied JWTs and populates identity, without requiring them', async () => {
        expect((await get('/optional')).json().authUser).toBeNull();
        const response = await get('/optional', valid);
        expect(response.statusCode).toBe(200);
        expect(response.json().authUser).toMatchObject(claims);
        expect(response.json().token).toBe(valid);
        expect((await get('/optional', 'invalid')).statusCode).toBe(401);
    });

    it('ignores absent, malformed, expired and valid Bearers only on the configured route', async () => {
        for (const token of [undefined, 'invalid', expired, valid]) {
            const response = await get('/ignore/123?source=test', token);
            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual({authUser: null, token: null});
        }
    });

    it('leaves rejection of an invalid external credential to the route verifier', async () => {
        const before = externalChecks;
        const response = await get('/external', 'external-invalid');
        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({error: 'External credential rejected'});
        expect(externalChecks).toBe(before + 1);
        expect((await get('/external', 'external-valid')).json()).toEqual({authUser: null, token: null});
    });

    it('retains authentication requirements and valid JWT support on protected routes', async () => {
        expect((await get('/protected')).statusCode).toBe(401);
        expect((await get('/protected', 'invalid')).statusCode).toBe(401);
        const response = await get('/protected', valid);
        expect(response.statusCode).toBe(200);
        expect(response.json().authUser).toMatchObject(claims);
    });

    it('rejects an expired protected JWT with one 498 response before authorization/handler', async () => {
        const before = protectedCalls;
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const response = await get('/protected', expired);
            expect(response.statusCode).toBe(498);
            expect(response.json()).toEqual({error: 'JWT expirado'});
            expect(protectedCalls).toBe(before);
            expect(error).toHaveBeenCalledTimes(1);
        } finally {
            error.mockRestore();
        }
    });

    it('preserves the legacy login/refresh/logout exclusions including query strings', async () => {
        for (const url of ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']) {
            const response = await app.inject({method: 'POST', url: `${url}?source=test`, headers: {authorization: `Bearer ${expired}`}});
            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual({authUser: null, token: null});
        }
    });
});
