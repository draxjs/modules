import {afterEach, describe, expect, it, vi} from 'vitest'
import {HttpRestClient} from '../src/clients/HttpRestClient'
import type {IHttpOptions} from '../src/interfaces/IHttpClient'

const methods = ['get', 'post', 'put', 'patch', 'delete'] as const
function request(client: HttpRestClient, method: typeof methods[number], options?: IHttpOptions) {
    return method === 'get' ? client.get('/resource', options) : client[method]('/resource', {}, options)
}
function mockFetch() {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ok: true})))
    vi.stubGlobal('fetch', fetch)
    return fetch
}
afterEach(() => vi.unstubAllGlobals())

describe.each(methods)('HttpRestClient %s', method => {
    it.each(['Authorization', 'authorization', 'AUTHORIZATION'])('removing %s skips preflight and removes every casing only for this request', async removed => {
        const fetch = mockFetch()
        const baseHeaders = {'content-type': 'application/json', Authorization: 'Bearer stale', authorization: 'Bearer duplicate'}
        const headers = {AUTHORIZATION: 'Bearer request', 'X-Request': 'kept'}
        const options = {headers, removeHeaders: [removed]}
        const client = new HttpRestClient('', baseHeaders)
        const hook = vi.fn(async () => { throw new Error('must not renew') })
        client.setBeforeRequest(hook)
        await request(client, method, options)
        expect(hook).not.toHaveBeenCalled()
        expect(fetch.mock.calls[0][1].headers).toEqual({'content-type': 'application/json', 'X-Request': 'kept'})
        expect(baseHeaders).toEqual({'content-type': 'application/json', Authorization: 'Bearer stale', authorization: 'Bearer duplicate'})
        expect(options).toEqual({headers: {AUTHORIZATION: 'Bearer request', 'X-Request': 'kept'}, removeHeaders: [removed]})
    })

    it('awaits preflight before reading headers; removing another header does not skip it', async () => {
        const fetch = mockFetch()
        const client = new HttpRestClient('', {Authorization: 'Bearer stale', 'Content-Type': 'application/json'})
        const hook = vi.fn(async () => {
            await Promise.resolve()
            client.addHeader('Authorization', 'Bearer renewed')
        })
        client.setBeforeRequest(hook)
        await request(client, method, {removeHeaders: ['CONTENT-type']})
        expect(hook).toHaveBeenCalledWith('/resource')
        expect(fetch.mock.calls[0][1].headers).toEqual({Authorization: 'Bearer renewed'})
        expect(client.getBaseHeaders()['Content-Type']).toBe('application/json')
    })

    it('does not send the request or wrap the error if preflight rejects', async () => {
        const fetch = mockFetch()
        const client = new HttpRestClient()
        const error = new Error('refresh denied')
        client.setBeforeRequest(async () => { throw error })
        await expect(request(client, method)).rejects.toBe(error)
        expect(fetch).not.toHaveBeenCalled()
    })
})

it('does not temporarily clear shared headers during a concurrent unauthenticated request', async () => {
    const fetch = mockFetch()
    const client = new HttpRestClient('', {Authorization: 'Bearer original'})
    let release!: () => void
    const barrier = new Promise<void>(resolve => { release = resolve })
    client.setBeforeRequest(async () => {
        await barrier
        client.addHeader('Authorization', 'Bearer renewed')
    })
    const authenticated = client.get('/protected')
    await client.post('/refresh', {}, {removeHeaders: ['Authorization']})
    expect(client.getHeaderValue('Authorization')).toBe('Bearer original')
    expect(fetch.mock.calls[0][0]).toBe('/refresh')
    expect(fetch.mock.calls[0][1].headers).toEqual({})
    release()
    await authenticated
    expect(fetch.mock.calls[1][0]).toBe('/protected')
    expect(fetch.mock.calls[1][1].headers).toEqual({Authorization: 'Bearer renewed'})
})
