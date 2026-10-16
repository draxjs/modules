import {afterEach, describe, expect, it, vi} from 'vitest'
import {HttpRestClient} from '@drax/common-front'
import {AuthRestProvider} from '../src/providers/rest/AuthRestProvider'
import {AuthSystem} from '../src/system/AuthSystem'
import type {IAuthProvider} from '../src/interfaces/IAuthProvider'

function setup() {
    const client = new HttpRestClient('https://api.example.test')
    const provider = new AuthRestProvider(client)
    return {client, provider, system: new AuthSystem(provider)}
}

function respond(body: object) {
    return new Response(JSON.stringify(body), {status: 200, headers: {'content-type': 'application/json'}})
}

afterEach(() => vi.unstubAllGlobals())

describe('Optional remembered REST authentication', () => {
    it('preserves the ordinary login body and response', async () => {
        const fetch = vi.fn().mockResolvedValue(respond({accessToken: 'ordinary'}))
        vi.stubGlobal('fetch', fetch)
        const {client, system} = setup()
        expect(await system.login('user', 'password')).toEqual({accessToken: 'ordinary'})
        expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({username: 'user', password: 'password'})
        expect(client.getHeaderValue('Authorization')).toBe('Bearer ordinary')
    })

    it('passes explicit opt-in and preserves rotating credentials without persisting them in the provider', async () => {
        const result = {accessToken: 'access', refreshToken: 'refresh', refreshExpiresAt: '2030-01-01T00:00:00.000Z'}
        const fetch = vi.fn().mockResolvedValue(respond(result))
        vi.stubGlobal('fetch', fetch)
        const {system} = setup()
        expect(await system.login('user', 'password', true)).toEqual(result)
        expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({username: 'user', password: 'password', rememberMe: true})
    })

    it('refresh and revocation do not send a stale JWT or commit a late refresh header', async () => {
        const next = {accessToken: 'next', refreshToken: 'next-refresh', refreshExpiresAt: '2030-01-01T00:00:00.000Z'}
        const fetch = vi.fn().mockResolvedValueOnce(respond(next)).mockResolvedValueOnce(respond({success: true}))
        vi.stubGlobal('fetch', fetch)
        const {client, system} = setup()
        client.addHeader('Authorization', 'Bearer previous')
        expect(await system.refresh('old-refresh')).toEqual(next)
        expect(client.getHeaderValue('Authorization')).toBe('Bearer previous')
        await system.revokeSession(next.refreshToken)
        expect(fetch.mock.calls.map(([url]) => url)).toEqual([
            'https://api.example.test/api/auth/refresh', 'https://api.example.test/api/auth/logout'
        ])
        for (const [, options] of fetch.mock.calls) expect(options.headers).not.toHaveProperty('Authorization')
        expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({refreshToken: 'old-refresh'})
        expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({refreshToken: 'next-refresh'})
    })

    it('keeps custom legacy providers compatible and fails explicitly for unsupported refresh', async () => {
        const login = vi.fn().mockResolvedValue({accessToken: 'legacy'})
        const system = new AuthSystem({login} as unknown as IAuthProvider)
        expect(await system.login('user', 'password')).toEqual({accessToken: 'legacy'})
        expect(login).toHaveBeenCalledWith('user', 'password')
        await expect(system.refresh('refresh')).rejects.toThrow('provider supporting refresh')
        await expect(system.revokeSession('refresh')).resolves.toBeUndefined()
    })
})

describe('Shared REST preflight', () => {
    it.each(['get', 'post', 'put', 'patch', 'delete'] as const)('%s awaits renewal before copying headers', async (method) => {
        const fetch = vi.fn().mockResolvedValue(respond({ok: true}))
        vi.stubGlobal('fetch', fetch)
        const {client} = setup()
        client.addHeader('Authorization', 'Bearer expired')
        const preflight = vi.fn(async () => {
            await Promise.resolve()
            client.addHeader('Authorization', 'Bearer renewed')
        })
        client.setBeforeRequest(preflight)
        await client[method]('/api/person', {})
        expect(preflight).toHaveBeenCalledWith('/api/person')
        expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer renewed')
    })

    it('does not send the original request when renewal fails, preserving the credential error', async () => {
        const fetch = vi.fn()
        vi.stubGlobal('fetch', fetch)
        const {client} = setup()
        const rejectedCredential = new Error('refresh denied')
        client.setBeforeRequest(async () => { throw rejectedCredential })
        await expect(client.get('/api/person')).rejects.toBe(rejectedCredential)
        expect(fetch).not.toHaveBeenCalled()
    })
})
