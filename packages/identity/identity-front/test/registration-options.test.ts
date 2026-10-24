import {afterEach, describe, expect, it, vi} from 'vitest'
import {HttpRestClient} from '@drax/common-front'
import {AuthRestProvider} from '../src/providers/rest/AuthRestProvider'
import AuthGqlProvider from '../src/providers/gql/AuthGqlProvider'
import {AuthSystem} from '../src/system/AuthSystem'
import type {IGqlClient} from '@drax/common-front'

afterEach(() => vi.unstubAllGlobals())

describe('registration options', () => {
    it.each([true, false])('loads public REST options (tenantRequired=%s)', async (tenantRequired) => {
        const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({tenantRequired}), {
            status: 200, headers: {'content-type': 'application/json'}
        }))
        vi.stubGlobal('fetch', fetch)
        const client = new HttpRestClient('https://api.example.test')
        client.addHeader('Authorization', 'Bearer stale')
        const system = new AuthSystem(new AuthRestProvider(client))
        expect(await system.registrationOptions()).toEqual({tenantRequired})
        expect(fetch.mock.calls[0][0]).toBe('https://api.example.test/api/auth/registration-options')
        expect(fetch.mock.calls[0][1].method).toBe('GET')
        expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization')
    })

    it('propagates option-loading errors', async () => {
        const error = new Error('offline')
        const system = new AuthSystem(new AuthRestProvider({get: vi.fn().mockRejectedValue(error)} as any))
        await expect(system.registrationOptions()).rejects.toBe(error)
    })

    it('preserves the registration endpoint and optional tenant payload', async () => {
        const post = vi.fn().mockResolvedValue({success: true, message: 'ok'})
        const system = new AuthSystem(new AuthRestProvider({post} as any))
        const form = {name: 'Name', username: 'user', email: 'user@test.com', phone: '123', avatar: ''}
        await system.register(form)
        expect(post).toHaveBeenLastCalledWith('/api/users/register', form, {removeHeaders: ['Authorization']})
        await system.register({...form, tenantName: 'Organization'})
        expect(post).toHaveBeenLastCalledWith('/api/users/register', {...form, tenantName: 'Organization'}, {removeHeaders: ['Authorization']})
    })

    it('registers anonymously even when the shared HTTP client has a stale bearer', async () => {
        const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({success: true}), {
            status: 200, headers: {'content-type': 'application/json'}
        }))
        vi.stubGlobal('fetch', fetch)
        const client = new HttpRestClient('https://api.example.test')
        client.addHeader('Authorization', 'Bearer stale')
        const system = new AuthSystem(new AuthRestProvider(client))
        await system.register({name: 'Name', username: 'user', email: 'user@test.com', phone: '123', avatar: '', tenantName: 'Organization'})
        expect(fetch.mock.calls[0][0]).toBe('https://api.example.test/api/users/register')
        expect(new Headers(fetch.mock.calls[0][1].headers).has('Authorization')).toBe(false)
        // Removing the header applies to this request only, not other authenticated requests.
        fetch.mockResolvedValueOnce(new Response('{}', {status: 200}))
        await client.get('/api/protected')
        expect(new Headers(fetch.mock.calls[1][1].headers).get('Authorization')).toBe('Bearer stale')
    })

    it('returns the documented GQL fallback without making up a query', async () => {
        const query = vi.fn()
        const system = new AuthSystem(new AuthGqlProvider({query} as unknown as IGqlClient))
        expect(await system.registrationOptions()).toEqual({tenantRequired: false})
        expect(query).not.toHaveBeenCalled()
    })
})
