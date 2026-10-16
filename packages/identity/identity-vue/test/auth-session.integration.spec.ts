import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {createApp} from 'vue'
import {createPinia, setActivePinia} from 'pinia'
import {createMemoryHistory, createRouter, isNavigationFailure, NavigationFailureType} from 'vue-router'
import {AuthRestProvider, AuthSystem, AuthSystemFactory} from '@drax/identity-front'
import {HttpClientFactory, HttpRestClient, HttpRestClientFactory} from '@drax/common-front'
import {setupAuthSession} from '../src/composables/setupAuthSession'
import {useAuthStore} from '../src/stores/AuthStore'
import {useAuth} from '../src/composables/useAuth'
import {authGuard} from '../../../zuite/zuite-front/src/router/authGuard'

const jwt = (seconds: number) => `e30.${btoa(JSON.stringify({exp: Math.floor(Date.now() / 1000) + seconds}))}.sig`
const user = {username: 'test', role: {permissions: ['users:view']}}
const expiresAt = () => new Date(Date.now() + 86400000).toISOString()
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: {'Content-Type': 'application/json'},
})
function deferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>(r => {resolve = r})
    return {promise, resolve}
}

// No provider/client/factory/router mocks: fetch is the only mocked dependency.
const fetchMock = vi.fn<typeof fetch>()
let client: HttpRestClient
let app: ReturnType<typeof createApp>
let router: ReturnType<typeof createRouter>

beforeEach(async () => {
    vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', 'true')
    localStorage.clear()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    client = new HttpRestClient('https://api.example.test', undefined, 2000)
    HttpRestClientFactory.instance = client
    HttpClientFactory.instance = client
    AuthSystemFactory.singleton = new AuthSystem(new AuthRestProvider(client))
    app = createApp({render: () => null})
    const pinia = createPinia()
    app.use(pinia)
    setActivePinia(pinia)
    const component = {render: () => null}
    router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {path: '/', name: 'Public', component},
            {path: '/login', name: 'Login', component},
            {path: '/users', name: 'Users', component, meta: {auth: true, permission: 'users:view'}},
        ],
    })
    app.use(router)
    await router.isReady()
    router.beforeEach(authGuard)
    await setupAuthSession()
})

afterEach(() => {
    router.options.history.destroy()
    HttpRestClientFactory.instance = null
    HttpClientFactory.instance = null
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
})

describe('real REST session integration', () => {
    it('single-flights guard + concurrent CRUD preflights, refreshes me internally without deadlock and sends fresh headers', async () => {
        const freshToken = jwt(600)
        const refresh = deferred<Response>()
        const me = deferred<Response>()
        const requests: {path: string, headers: Headers, body: unknown}[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            const request = {path, headers: new Headers(init?.headers), body: init?.body ? JSON.parse(String(init.body)) : undefined}
            requests.push(request)
            if (path === '/api/auth/refresh') return refresh.promise
            if (path === '/api/auth/me') return me.promise
            return json({ok: true})
        })
        useAuthStore().setSession({accessToken: jwt(-60), refreshToken: 'r1', refreshExpiresAt: expiresAt()})
        const pending = Promise.all([
            router.push('/users'),
            client.get('/api/users'),
            client.post('/api/users', {username: 'new'}),
            client.put('/api/users/1', {username: 'changed'}),
            client.patch('/api/users/1', {username: 'patched'}),
            client.delete('/api/users/1'),
        ])
        await vi.waitFor(() => expect(requests).toHaveLength(1))
        expect(requests[0].path).toBe('/api/auth/refresh')
        expect(requests[0].body).toEqual({refreshToken: 'r1'})
        expect(requests[0].headers.has('Authorization')).toBe(false)
        refresh.resolve(json({accessToken: freshToken, refreshToken: 'r2', refreshExpiresAt: expiresAt()}))
        await vi.waitFor(() => expect(requests).toHaveLength(2))
        expect(requests[1].path).toBe('/api/auth/me')
        expect(requests[1].headers.get('Authorization')).toBe(`Bearer ${freshToken}`)
        // CRUD waits for the internal me, which must bypass its own renewal flight.
        me.resolve(json(user))
        await pending
        expect(router.currentRoute.value.name).toBe('Users')
        expect(requests.filter(r => r.path === '/api/auth/refresh')).toHaveLength(1)
        expect(requests.filter(r => r.path === '/api/auth/me')).toHaveLength(1)
        const crud = requests.filter(r => r.path.startsWith('/api/users'))
        expect(crud).toHaveLength(5)
        for (const request of crud) expect(request.headers.get('Authorization')).toBe(`Bearer ${freshToken}`)
        expect(useAuthStore().accessToken).toBe(freshToken)
        expect(useAuthStore().authUser).toEqual(user)
        expect(JSON.parse(localStorage.getItem('AuthStore')!).refreshToken).toBe('r2')
    }, 4000)

    it('renews on navigation alone after inactivity, before synchronous auth/permission checks', async () => {
        const freshToken = jwt(600)
        fetchMock.mockImplementation(async input => {
            const path = new URL(String(input)).pathname
            if (path === '/api/auth/refresh') return json({accessToken: freshToken, refreshToken: 'r2', refreshExpiresAt: expiresAt()})
            if (path === '/api/auth/me') return json(user)
            throw new Error(`Unexpected request: ${path}`)
        })
        useAuthStore().setSession({accessToken: jwt(-60), refreshToken: 'r1', refreshExpiresAt: expiresAt()})
        await router.push('/users')
        expect(router.currentRoute.value.name).toBe('Users')
        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('disabled remember-me follows the normal login redirect even with legacy persisted refresh credentials', async () => {
        vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', 'false')
        useAuthStore().setSession({accessToken: jwt(-60), refreshToken: 'legacy-refresh', refreshExpiresAt: expiresAt()})
        await router.push('/users')
        expect(router.currentRoute.value.name).toBe('Login')
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('ordinary login never refreshes or extends its JWT, including after inactivity', async () => {
        const token = jwt(600)
        const requests: {path: string, body: unknown, authorization: string | null}[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            requests.push({path, body: init?.body ? JSON.parse(String(init.body)) : undefined,
                authorization: new Headers(init?.headers).get('Authorization')})
            if (path === '/api/auth/login') return json({accessToken: token})
            if (path === '/api/auth/me') return json(user)
            if (path.startsWith('/api/users')) return json([])
            throw new Error(`Unexpected request: ${path}`)
        })
        await app.runWithContext(() => useAuth()).login('test', 'password')
        expect(requests[0]).toMatchObject({path: '/api/auth/login', body: {username: 'test', password: 'password'}})
        expect(requests[1].authorization).toBe(`Bearer ${token}`)
        expect(useAuthStore().refreshToken).toBeNull()
        await client.get('/api/users')
        const expired = jwt(-60)
        useAuthStore().setAccessToken(expired)
        await client.get('/api/users')
        expect(requests[requests.length - 1].authorization).toBe(`Bearer ${expired}`)
        await router.push('/users')
        expect(router.currentRoute.value.name).toBe('Login')
        expect(useAuthStore().accessToken).toBe(expired)
        expect(requests.some(r => r.path === '/api/auth/refresh')).toBe(false)
    })

    it('cancels protected navigation on transient refresh failure without throwing or losing credentials', async () => {
        fetchMock.mockImplementation(async () => json({message: 'Temporarily unavailable'}, 503))
        const session = {accessToken: jwt(-60), refreshToken: 'r1', refreshExpiresAt: expiresAt()}
        useAuthStore().setSession(session)
        const failure = await router.push('/users')
        expect(isNavigationFailure(failure, NavigationFailureType.aborted)).toBe(true)
        expect(router.currentRoute.value.name).toBe('Public')
        expect(useAuthStore().refreshToken).toBe('r1')
        expect(useAuthStore().accessToken).toBe(session.accessToken)
        // Public routes remain reachable offline.
        await router.push('/login')
        expect(router.currentRoute.value.name).toBe('Login')
    })

    it.each([
        {initial: 'setup', trigger: 'navigation'},
        {initial: 'setup', trigger: 'api'},
        {initial: 'navigation', trigger: 'navigation'},
        {initial: 'navigation', trigger: 'api'},
    ])('retries an absent profile after $initial on next $trigger with a fresh JWT, without another refresh', async ({initial, trigger}) => {
        const freshToken = jwt(600)
        const retry = deferred<Response>()
        let refreshes = 0
        let profiles = 0
        const crudHeaders: (string | null)[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            if (path === '/api/auth/refresh') {
                refreshes++
                return json({accessToken: freshToken, refreshToken: 'r2', refreshExpiresAt: expiresAt()})
            }
            if (path === '/api/auth/me') {
                profiles++
                expect(new Headers(init?.headers).get('Authorization')).toBe(`Bearer ${freshToken}`)
                return profiles === 1 ? json({message: 'Profile temporarily unavailable'}, 503) : retry.promise
            }
            crudHeaders.push(new Headers(init?.headers).get('Authorization'))
            return json([])
        })
        const store = useAuthStore()
        store.setSession({accessToken: jwt(-60), refreshToken: 'r1', refreshExpiresAt: expiresAt()})
        if (initial === 'setup') {
            await setupAuthSession()
        } else {
            const firstNavigation = await router.push('/users')
            expect(isNavigationFailure(firstNavigation, NavigationFailureType.aborted)).toBe(true)
        }
        expect(router.currentRoute.value.name).toBe('Public')
        expect(store.accessToken).toBe(freshToken)
        expect(store.refreshToken).toBe('r2')
        expect(store.authUser).toBeNull()
        expect(profiles).toBe(1)
        const pending = trigger === 'navigation'
            ? router.push('/users')
            : Promise.all([client.get('/api/users'), client.get('/api/users/1'), router.push('/users')])
        await vi.waitFor(() => expect(profiles).toBe(2))
        expect(refreshes).toBe(1)
        expect(crudHeaders).toHaveLength(0)
        retry.resolve(json(user))
        await pending
        expect(router.currentRoute.value.name).toBe('Users')
        expect(store.authUser).toEqual(user)
        expect(profiles).toBe(2)
        expect(refreshes).toBe(1)
        for (const header of crudHeaders) expect(header).toBe(`Bearer ${freshToken}`)
    }, 4000)

    it('does not resurrect a cross-tab null-to-null logout after the real login provider sets a late header', async () => {
        const response = deferred<Response>()
        const revoked: unknown[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            if (path === '/api/auth/login') return response.promise
            if (path === '/api/auth/logout') {
                revoked.push(JSON.parse(String(init?.body)))
                expect(new Headers(init?.headers).has('Authorization')).toBe(false)
                return json({success: true})
            }
            throw new Error(`Unexpected request: ${path}`)
        })
        const store = useAuthStore()
        const pending = app.runWithContext(() => useAuth()).login('u', 'p', true)
        const result = expect(pending).rejects.toThrow('cancelled')
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
        const loginVersion = store.sessionVersion
        const otherTab = useAuthStore(createPinia())
        otherTab.clearAuth()
        const logoutVersion = otherTab.sessionVersion
        expect(logoutVersion).not.toBe(loginVersion)
        response.resolve(json({accessToken: jwt(600), refreshToken: 'late-r1', refreshExpiresAt: expiresAt()}))
        await result
        expect(store.accessToken).toBeNull()
        expect(store.authUser).toBeNull()
        expect(client.getBaseHeaders().Authorization).toBeUndefined()
        expect(revoked).toEqual([{refreshToken: 'late-r1'}])
        expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({sessionVersion: logoutVersion, accessToken: null, refreshToken: null})
    })

    it('redirects rejected refresh credentials to login without throwing navigation', async () => {
        fetchMock.mockImplementation(async () => json({message: 'Invalid refresh token'}, 401))
        useAuthStore().setSession({accessToken: jwt(-60), refreshToken: 'r1', refreshExpiresAt: expiresAt()})
        await router.push('/users')
        expect(router.currentRoute.value.name).toBe('Login')
        expect(router.currentRoute.value.query.redirect).toBe('/users')
        expect(useAuthStore().refreshToken).toBeNull()
        expect(client.getBaseHeaders().Authorization).toBeUndefined()
    })
})
