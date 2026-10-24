import {afterEach, describe, expect, it, vi} from 'vitest'
import {HttpRestClient} from '@drax/common-front'
import {AuthRestProvider} from '../src/providers/rest/AuthRestProvider'

const independentRequests = [
    ['login', '/api/auth/login', (p: AuthRestProvider) => p.login('user', 'password')],
    ['refresh', '/api/auth/refresh', (p: AuthRestProvider) => p.refresh('refresh-token')],
    ['revokeSession', '/api/auth/logout', (p: AuthRestProvider) => p.revokeSession('refresh-token')],
    ['registrationOptions', '/api/auth/registration-options', (p: AuthRestProvider) => p.registrationOptions()],
    ['passwordPolicy', '/api/auth/password-policy', (p: AuthRestProvider) => p.passwordPolicy()],
    ['recoveryPasswordRequest', '/api/users/password/recovery/request', (p: AuthRestProvider) => p.recoveryPasswordRequest('user@example.test')],
    ['recoveryPasswordComplete', '/api/users/password/recovery/complete', (p: AuthRestProvider) => p.recoveryPasswordComplete('code', 'new-password')],
    ['resendVerificationEmail', '/api/users/verification/resend', (p: AuthRestProvider) => p.resendVerificationEmail('user@example.test')],
    ['register', '/api/users/register', (p: AuthRestProvider) => p.register({name: 'Name', username: 'user', email: 'user@example.test', phone: '', avatar: ''})],
] as const

afterEach(() => vi.unstubAllGlobals())

describe('Session-independent REST auth contracts', () => {
    it.each(independentRequests)('%s removes stale authorization and cannot enter a failing refresh hook', async (name, url, invoke) => {
        const fetch = vi.fn(async () => new Response(JSON.stringify({accessToken: 'new-access'})))
        vi.stubGlobal('fetch', fetch)
        const client = new HttpRestClient('', {Authorization: 'Bearer stale', authorization: 'Bearer stale-lowercase'})
        const hook = vi.fn(async () => { throw new Error('renewal unavailable') })
        client.setBeforeRequest(hook)
        await invoke(new AuthRestProvider(client))
        expect(hook).not.toHaveBeenCalled()
        expect(fetch.mock.calls).toHaveLength(1)
        expect(fetch.mock.calls[0][0]).toBe(url)
        expect(new Headers(fetch.mock.calls[0][1].headers).has('authorization')).toBe(false)
        // Login intentionally commits its successful result; the other endpoints do not.
        expect(client.getHeaderValue('Authorization')).toBe(name === 'login' ? 'Bearer new-access' : 'Bearer stale')
        expect(client.getHeaderValue('authorization')).toBe('Bearer stale-lowercase')
    })

    it.each([
        ['me', (p: AuthRestProvider) => p.me()],
        ['switchTenant', (p: AuthRestProvider) => p.switchTenant('tenant')],
        ['changeOwnPassword', (p: AuthRestProvider) => p.changeOwnPassword('old', 'new')],
        ['changeAvatar', (p: AuthRestProvider) => p.changeAvatar(new Blob(['avatar']) as File)],
    ] as const)('%s keeps the authenticated preflight', async (_name, invoke) => {
        const fetch = vi.fn(async () => new Response(JSON.stringify({accessToken: 'next'})))
        vi.stubGlobal('fetch', fetch)
        const client = new HttpRestClient()
        const hook = vi.fn(async () => { client.addHeader('Authorization', 'Bearer renewed') })
        client.setBeforeRequest(hook)
        await invoke(new AuthRestProvider(client))
        expect(hook).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer renewed')
    })

    it('refresh inside preflight completes without recursion and the caller commits the new JWT', async () => {
        const fetch = vi.fn(async () => new Response(JSON.stringify({accessToken: 'renewed'})))
        vi.stubGlobal('fetch', fetch)
        const client = new HttpRestClient('', {Authorization: 'Bearer stale'})
        const provider = new AuthRestProvider(client)
        const hook = vi.fn(async () => {
            const result = await provider.refresh('refresh-token')
            provider.setHttpClientToken(result.accessToken)
        })
        client.setBeforeRequest(hook)
        await provider.me()
        expect(hook).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls.map(([url]) => url)).toEqual(['/api/auth/refresh', '/api/auth/me'])
        expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization')
        expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer renewed')
    })
})
