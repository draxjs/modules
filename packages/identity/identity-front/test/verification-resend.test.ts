import {afterEach, describe, expect, it, vi} from 'vitest'
import {HttpRestClient} from '@drax/common-front'
import {AuthRestProvider} from '../src/providers/rest/AuthRestProvider'
import AuthGqlProvider from '../src/providers/gql/AuthGqlProvider'
import {AuthSystem} from '../src/system/AuthSystem'
import type {IAuthProvider} from '../src/interfaces/IAuthProvider'

const neutral = {success: true, message: 'If an account is pending verification, activation instructions will be sent.'}
const form = {name: 'Name', username: 'user', email: 'user@example.test', phone: '123', avatar: ''}

afterEach(() => vi.unstubAllGlobals())

describe('verification API', () => {
    it.each([false, true, undefined])('preserves the registration response (verificationEmailSent=%s)', async verificationEmailSent => {
        const response = {success: true, message: 'User registered successfully.',
            ...(verificationEmailSent === undefined ? {} : {verificationEmailSent})}
        const system = new AuthSystem(new AuthRestProvider({post: vi.fn().mockResolvedValue(response)} as any))
        expect(await system.register(form)).toEqual(response)
    })

    it('posts only email anonymously and leaves shared headers untouched', async () => {
        const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify(neutral), {
            status: 200, headers: {'content-type': 'application/json'}
        }))
        vi.stubGlobal('fetch', fetch)
        const client = new HttpRestClient('https://api.example.test')
        client.addHeader('Authorization', 'Bearer stale')
        client.addHeader('X-Tenant', 'tenant')
        const system = new AuthSystem(new AuthRestProvider(client))
        expect(await system.resendVerificationEmail('pending@example.test')).toEqual(neutral)
        const [url, init] = fetch.mock.calls[0]
        expect(url).toBe('https://api.example.test/api/users/verification/resend')
        expect(init.method).toBe('POST')
        expect(JSON.parse(init.body)).toEqual({email: 'pending@example.test'})
        expect(new Headers(init.headers).has('Authorization')).toBe(false)
        expect(new Headers(init.headers).get('X-Tenant')).toBe('tenant')
        await client.get('/api/protected')
        expect(new Headers(fetch.mock.calls[1][1].headers).get('Authorization')).toBe('Bearer stale')
    })

    it('propagates transport errors through AuthSystem', async () => {
        const error = new Error('offline')
        const system = new AuthSystem(new AuthRestProvider({post: vi.fn().mockRejectedValue(error)} as any))
        await expect(system.resendVerificationEmail('user@example.test')).rejects.toBe(error)
    })

    it('preserves registration for legacy providers without resend support', async () => {
        const response = {success: true, message: 'ok'}
        const register = vi.fn().mockResolvedValue(response)
        const system = new AuthSystem({register} as unknown as IAuthProvider)
        expect(await system.register(form)).toEqual(response)
        await expect(system.resendVerificationEmail(form.email)).rejects.toThrow('resendVerificationEmail is not implemented by this provider')
    })

    it('explicitly rejects GraphQL without inventing a query or mutation', async () => {
        const query = vi.fn()
        const mutation = vi.fn()
        const system = new AuthSystem(new AuthGqlProvider({query, mutation} as any))
        await expect(system.resendVerificationEmail('user@example.test')).rejects.toThrow('resendVerificationEmail is not implemented for GraphQL')
        expect(query).not.toHaveBeenCalled()
        expect(mutation).not.toHaveBeenCalled()
    })
})
