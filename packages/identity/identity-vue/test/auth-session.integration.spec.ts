import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {createApp} from 'vue'
import {createPinia, setActivePinia} from 'pinia'
import {createMemoryHistory, createRouter, isNavigationFailure, NavigationFailureType} from 'vue-router'
import {AuthRestProvider, AuthSystem, AuthSystemFactory} from '@drax/identity-front'
import type {ILoginResponse} from '@drax/identity-front'
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
    const externalSession = (rememberMe: boolean) => client.post('/api/google/login', {rememberMe},
        {removeHeaders: ['Authorization']}) as Promise<ILoginResponse>

    it.each([
        {flag: 'true', requested: undefined, remembered: false},
        {flag: 'true', requested: false, remembered: false},
        {flag: 'true', requested: true, remembered: true},
        {flag: 'false', requested: true, remembered: false},
        {flag: undefined, requested: true, remembered: false},
    ])('external session honors opt-in ($flag / $requested), clears synchronously and never mixes prior credentials', async ({flag, requested, remembered}) => {
        vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', flag)
        const store = useAuthStore()
        const otherClient = new HttpRestClient()
        HttpClientFactory.instance = otherClient
        store.setSession({accessToken: jwt(-60), refreshToken: 'previous-refresh', refreshExpiresAt: expiresAt()})
        store.setAuthUser({...user, username: 'previous'} as any)
        const response = {accessToken: jwt(600), refreshToken: 'external-refresh', refreshExpiresAt: expiresAt()}
        const requests: {path: string, authorization: string | null, body: unknown}[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            requests.push({path, authorization: new Headers(init?.headers).get('Authorization'),
                body: init?.body ? JSON.parse(String(init.body)) : undefined})
            if (path === '/api/google/login') return json(response)
            if (path === '/api/auth/me') return json(user)
            if (path === '/api/auth/logout') throw new TypeError('offline')
            throw new Error(`Unexpected request: ${path}`)
        })
        let invoked = false
        const pending = app.runWithContext(() => useAuth()).loginWithSession(effective => {
            invoked = true
            expect(effective).toBe(remembered)
            expect(store.$state).toMatchObject({accessToken: null, refreshToken: null, refreshExpiresAt: null, authUser: null})
            expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({accessToken: null, refreshToken: null, authUser: null})
            for (const shared of [client, otherClient]) expect(new Headers(shared.getBaseHeaders()).has('Authorization')).toBe(false)
            return externalSession(effective)
        }, requested)
        expect(invoked).toBe(true)
        await pending
        expect(requests[0]).toEqual({path: '/api/google/login', authorization: null, body: {rememberMe: remembered}})
        expect(requests.find(r => r.path === '/api/auth/me')?.authorization).toBe(`Bearer ${response.accessToken}`)
        expect(requests.some(r => r.path === '/api/auth/refresh')).toBe(false)
        const confirmed = {accessToken: response.accessToken, refreshToken: remembered ? response.refreshToken : null,
            refreshExpiresAt: remembered ? response.refreshExpiresAt : null, authUser: user}
        expect(store.$state).toMatchObject(confirmed)
        expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject(confirmed)
        for (const shared of [client, otherClient]) expect(shared.getHeaderValue('Authorization')).toBe(`Bearer ${response.accessToken}`)
        await vi.waitFor(() => expect(requests.filter(r => r.path === '/api/auth/logout')).toHaveLength(remembered ? 0 : 1))
        if (!remembered) expect(requests.find(r => r.path === '/api/auth/logout')).toMatchObject({authorization: null, body: {refreshToken: response.refreshToken}})
    })

    it('ordinary external response authenticates without refresh credentials by default', async () => {
        const response = {accessToken: jwt(600)}
        fetchMock.mockImplementation(async input => {
            const path = new URL(String(input)).pathname
            if (path === '/api/google/login') return json(response)
            if (path === '/api/auth/me') return json(user)
            throw new Error(`Unexpected request: ${path}`)
        })
        const auth = app.runWithContext(() => useAuth())
        await auth.loginWithSession(externalSession)
        expect(auth.isAuthenticated()).toBe(true)
        expect(useAuthStore().refreshToken).toBeNull()
        expect(useAuthStore().refreshExpiresAt).toBeNull()
        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it.each(['request', 'profile', 'inside operation'] as const)('logout during external %s cancels late results even if revocation fails', async stage => {
        const response = deferred<Response>()
        const profile = deferred<Response>()
        let profiles = 0
        const revoked: unknown[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            if (path === '/api/google/login') return response.promise
            if (path === '/api/auth/me') return ++profiles === 1 ? json(user) : profile.promise
            if (path === '/api/auth/logout') {
                revoked.push(JSON.parse(String(init?.body)))
                expect(new Headers(init?.headers).has('Authorization')).toBe(false)
                throw new TypeError('offline')
            }
            throw new Error(`Unexpected request: ${path}`)
        })
        const auth = app.runWithContext(() => useAuth())
        let logout: Promise<void> | undefined
        const pending = auth.loginWithSession(remembered => {
            if (stage === 'inside operation') logout = auth.logout()
            return externalSession(remembered)
        }, true)
        const result = expect(pending).rejects.toThrow('cancelled')
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
        if (stage === 'profile') {
            response.resolve(json({accessToken: jwt(600), refreshToken: 'late-refresh', refreshExpiresAt: expiresAt()}))
            await vi.waitFor(() => expect(profiles).toBe(2))
        }
        await (logout ?? auth.logout())
        expect(router.currentRoute.value.name).toBe('Login')
        expect(useAuthStore().accessToken).toBeNull()
        expect(useAuthStore().authUser).toBeNull()
        if (stage === 'profile') profile.resolve(json(user))
        else response.resolve(json({accessToken: jwt(600), refreshToken: 'late-refresh', refreshExpiresAt: expiresAt()}))
        await result
        expect(revoked).toContainEqual({refreshToken: 'late-refresh'})
        expect(useAuthStore().$state).toMatchObject({accessToken: null, refreshToken: null, authUser: null})
        expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({accessToken: null, refreshToken: null, authUser: null})
        expect(new Headers(client.getBaseHeaders()).has('Authorization')).toBe(false)
        expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/api/auth/me'))).toHaveLength(stage === 'profile' ? 2 : 0)
    })

    it.each(['standard', 'external'] as const)('older external login cannot replace a newer %s login', async kind => {
        const old = deferred<Response>()
        const current = {accessToken: jwt(1200), refreshToken: 'current-refresh', refreshExpiresAt: expiresAt()}
        const currentUser = {...user, username: 'current'}
        let externalRequests = 0
        const revoked: unknown[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            if (path === '/api/google/login' && ++externalRequests === 1) return old.promise
            if (path === '/api/google/login' || path === '/api/auth/login') return json(current)
            if (path === '/api/auth/me') return json(currentUser)
            if (path === '/api/auth/logout') {
                revoked.push(JSON.parse(String(init?.body)))
                return json({success: true})
            }
            throw new Error(`Unexpected request: ${path}`)
        })
        const auth = app.runWithContext(() => useAuth())
        const pending = auth.loginWithSession(externalSession, true)
        const result = expect(pending).rejects.toThrow('cancelled')
        await vi.waitFor(() => expect(externalRequests).toBe(1))
        if (kind === 'standard') await auth.login('current', 'password', true)
        else await auth.loginWithSession(externalSession, true)
        old.resolve(json({accessToken: jwt(600), refreshToken: 'old-refresh', refreshExpiresAt: expiresAt()}))
        await result
        expect(useAuthStore().$state).toMatchObject({...current, authUser: currentUser})
        expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({...current, authUser: currentUser})
        expect(client.getHeaderValue('Authorization')).toBe(`Bearer ${current.accessToken}`)
        expect(revoked).toEqual([{refreshToken: 'old-refresh'}])
    })

    it.each([
        {stage: 'request', action: 'logout'}, {stage: 'profile', action: 'logout'},
        {stage: 'request', action: 'login'}, {stage: 'profile', action: 'login'},
    ])('cross-tab $action invalidates an external $stage without overwriting persisted state', async ({stage, action}) => {
        const response = deferred<Response>()
        const profile = deferred<Response>()
        let profiles = 0
        const revoked: unknown[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            if (path === '/api/google/login') return response.promise
            if (path === '/api/auth/me') return ++profiles === 1 ? json(user) : profile.promise
            if (path === '/api/auth/logout') {
                revoked.push(JSON.parse(String(init?.body)))
                return json({success: true})
            }
            throw new Error(`Unexpected request: ${path}`)
        })
        const store = useAuthStore()
        const pending = app.runWithContext(() => useAuth()).loginWithSession(externalSession, true)
        const result = expect(pending).rejects.toThrow('cancelled')
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
        if (stage === 'profile') {
            response.resolve(json({accessToken: jwt(600), refreshToken: 'discarded-refresh', refreshExpiresAt: expiresAt()}))
            await vi.waitFor(() => expect(profiles).toBe(2))
        }
        const otherTab = useAuthStore(createPinia())
        otherTab.clearAuth()
        if (action === 'login') {
            otherTab.setSession({accessToken: jwt(1200), refreshToken: 'other-tab-refresh', refreshExpiresAt: expiresAt()})
            otherTab.setAuthUser({...user, username: 'other-tab'} as any)
        }
        const persisted = localStorage.getItem('AuthStore')
        if (stage === 'profile') profile.resolve(json(user))
        else response.resolve(json({accessToken: jwt(600), refreshToken: 'discarded-refresh', refreshExpiresAt: expiresAt()}))
        await result
        expect(localStorage.getItem('AuthStore')).toBe(persisted)
        expect(store.$state).toEqual(otherTab.$state)
        expect(client.getHeaderValue('Authorization')).toBe(action === 'login' ? `Bearer ${otherTab.accessToken}` : '')
        expect(revoked).toEqual([{refreshToken: 'discarded-refresh'}])
    })

    it('external request rejection clears the previous session and profile failure revokes the newly confirmed session', async () => {
        const store = useAuthStore()
        store.setSession({accessToken: jwt(600), refreshToken: 'previous-refresh', refreshExpiresAt: expiresAt()})
        store.setAuthUser(user as any)
        const auth = app.runWithContext(() => useAuth())
        fetchMock.mockResolvedValueOnce(json({message: 'Invalid credential'}, 401))
        await expect(auth.loginWithSession(externalSession, true)).rejects.toBeDefined()
        expect(store.$state).toMatchObject({accessToken: null, refreshToken: null, authUser: null})
        const revoked: unknown[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            if (path === '/api/google/login') return json({accessToken: jwt(600), refreshToken: 'failed-profile-refresh', refreshExpiresAt: expiresAt()})
            if (path === '/api/auth/me') return json({message: 'Profile unavailable'}, 503)
            if (path === '/api/auth/logout') {
                revoked.push(JSON.parse(String(init?.body)))
                throw new TypeError('offline')
            }
            throw new Error(`Unexpected request: ${path}`)
        })
        await expect(auth.loginWithSession(externalSession, true)).rejects.toBeDefined()
        expect(revoked).toEqual([{refreshToken: 'failed-profile-refresh'}])
        expect(store.$state).toMatchObject({accessToken: null, refreshToken: null, authUser: null})
        expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({accessToken: null, refreshToken: null, authUser: null})
        expect(client.getHeaderValue('Authorization')).toBe('')
    })
    it.each(['after restore', 'during refresh', 'during profile'] as const)('restores a persisted expired external session with single-flight setup/guard/CRUD and logs out %s', async logoutStage => {
        const initial = {accessToken: jwt(600), refreshToken: 'external-refresh', refreshExpiresAt: expiresAt()}
        const rotated = {accessToken: jwt(1200), refreshToken: 'rotated-refresh', refreshExpiresAt: initial.refreshExpiresAt}
        const refresh = deferred<Response>()
        const profile = deferred<Response>()
        const requests: {path: string, authorization: string | null, body: unknown}[] = []
        let restoring = false
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            requests.push({path, authorization: new Headers(init?.headers).get('Authorization'),
                body: init?.body ? JSON.parse(String(init.body)) : undefined})
            if (path === '/api/google/login') return json(initial)
            if (path === '/api/auth/refresh') return refresh.promise
            if (path === '/api/auth/me') return restoring ? profile.promise : json(user)
            if (path === '/api/auth/logout') return json({success: true})
            if (path.startsWith('/api/users')) return json([])
            throw new Error(`Unexpected request: ${path}`)
        })
        const auth = app.runWithContext(() => useAuth())
        await auth.loginWithSession(externalSession, true)
        const store = useAuthStore()
        const persisted = JSON.parse(localStorage.getItem('AuthStore')!)
        expect(persisted).toMatchObject({...initial, authUser: user})
        // Simulate a reload after expiry: only persisted credentials survive startup.
        localStorage.setItem('AuthStore', JSON.stringify({...persisted, accessToken: jwt(-60), authUser: null}))
        store.$reset()
        expect(store.accessToken).toBeNull()
        restoring = true
        requests.length = 0
        const pending = Promise.all([setupAuthSession(), router.push('/users'), client.get('/api/users'), client.get('/api/users/1')])
        await vi.waitFor(() => expect(requests).toHaveLength(1))
        expect(requests[0]).toEqual({path: '/api/auth/refresh', authorization: null, body: {refreshToken: initial.refreshToken}})
        let logout: Promise<void> | undefined
        if (logoutStage === 'during refresh') logout = auth.logout()
        refresh.resolve(json(rotated))
        if (logoutStage !== 'during refresh') {
            await vi.waitFor(() => expect(requests.filter(r => r.path === '/api/auth/me')).toHaveLength(1))
            expect(requests.find(r => r.path === '/api/auth/me')?.authorization).toBe(`Bearer ${rotated.accessToken}`)
            expect(requests.some(r => r.path.startsWith('/api/users'))).toBe(false)
            if (logoutStage === 'during profile') logout = auth.logout()
            profile.resolve(json(user))
        }
        await pending
        await logout
        expect(requests.filter(r => r.path === '/api/auth/refresh')).toHaveLength(1)
        expect(requests.filter(r => r.path === '/api/auth/me')).toHaveLength(logoutStage === 'during refresh' ? 0 : 1)
        if (logoutStage === 'after restore') {
            expect(router.currentRoute.value.name).toBe('Users')
            expect(store.$state).toMatchObject({...rotated, authUser: user})
            expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({...rotated, authUser: user})
            for (const request of requests.filter(r => r.path.startsWith('/api/users'))) expect(request.authorization).toBe(`Bearer ${rotated.accessToken}`)
            await auth.logout()
        }
        expect(router.currentRoute.value.name).toBe('Login')
        const revocations = requests.filter(r => r.path === '/api/auth/logout')
        expect(revocations).toContainEqual({path: '/api/auth/logout', authorization: null, body: {refreshToken: rotated.refreshToken}})
        if (logoutStage === 'during refresh') expect(revocations).toContainEqual({path: '/api/auth/logout', authorization: null, body: {refreshToken: initial.refreshToken}})
        expect(store.$state).toMatchObject({accessToken: null, refreshToken: null, refreshExpiresAt: null, authUser: null})
        expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({accessToken: null, refreshToken: null, refreshExpiresAt: null, authUser: null})
        expect(client.getHeaderValue('Authorization')).toBe('')
    }, 4000)

    it('cleans an ordinary session that expires while the application stays open', async () => {
        const store = useAuthStore()
        store.setAccessToken(jwt(60))
        store.setAuthUser(user as any)
        expect(client.getHeaderValue('Authorization')).not.toBe('')
        const now = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 120_000)
        fetchMock.mockResolvedValue(json({ok: true}))
        try {
            await client.get('/api/users')
            expect(new Headers(fetchMock.mock.calls[0][1]?.headers).has('Authorization')).toBe(false)
            expect(store.accessToken).toBeNull()
            expect(store.authUser).toBeNull()
            expect(JSON.parse(localStorage.getItem('AuthStore')!).accessToken).toBeNull()
            expect(client.getHeaderValue('Authorization')).toBe('')
        } finally {
            now.mockRestore()
        }
    })

    it('direct store clearing synchronizes persisted state and both shared clients', () => {
        const other = new HttpRestClient()
        HttpClientFactory.instance = other
        const store = useAuthStore()
        const token = jwt(600)
        store.setSession({accessToken: token, refreshToken: 'r1', refreshExpiresAt: expiresAt()})
        store.setAuthUser(user as any)
        expect(other.getHeaderValue('Authorization')).toBe(`Bearer ${token}`)
        other.addHeader('authorization', 'Bearer legacy')
        store.clearAuth()
        expect(store.isAuth).toBe(false)
        expect(store.authUser).toBeNull()
        expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({accessToken: null, refreshToken: null, authUser: null})
        expect(new Headers(other.getBaseHeaders()).has('Authorization')).toBe(false)
        expect(new Headers(client.getBaseHeaders()).has('Authorization')).toBe(false)
    })

    it('external login bypasses stale Bearer and refresh without disturbing concurrent authenticated work', async () => {
        const store = useAuthStore()
        const stale = jwt(-60)
        store.setSession({accessToken: stale, refreshToken: 'r1', refreshExpiresAt: expiresAt()})
        client.addHeader('Authorization', `Bearer ${stale}`)
        const refresh = deferred<Response>()
        const fresh = jwt(600)
        const requests: {path: string, authorization: string | null}[] = []
        fetchMock.mockImplementation(async (input, init) => {
            const path = new URL(String(input)).pathname
            requests.push({path, authorization: new Headers(init?.headers).get('Authorization')})
            if (path === '/api/auth/refresh') return refresh.promise
            if (path === '/api/auth/me') return json(user)
            if (path === '/api/google/login') return json({error: 'Invalid Google credential'}, 401)
            return json({ok: true})
        })
        const protectedRequest = client.get('/api/users')
        await vi.waitFor(() => expect(requests).toHaveLength(1))
        await expect(client.post('/api/google/login', {credential: 'invalid'}, {removeHeaders: ['Authorization']})).rejects.toBeDefined()
        expect(requests[1]).toEqual({path: '/api/google/login', authorization: null})
        // The external credential rejection is not rejection of the recoverable Drax session.
        expect(store.refreshToken).toBe('r1')
        expect(store.accessToken).toBe(stale)
        refresh.resolve(json({accessToken: fresh, refreshToken: 'r2', refreshExpiresAt: expiresAt()}))
        await protectedRequest
        expect(requests.filter(r => r.path === '/api/auth/refresh')).toHaveLength(1)
        expect(requests.find(r => r.path === '/api/users')?.authorization).toBe(`Bearer ${fresh}`)
        expect(client.getHeaderValue('Authorization')).toBe(`Bearer ${fresh}`)
    })

    it.each([401, 403, 498, 503, 'offline'] as const)('blocks stale authenticated fetch on refresh failure %s', async status => {
        const store = useAuthStore()
        const token = jwt(-60)
        store.setSession({accessToken: token, refreshToken: 'r1', refreshExpiresAt: expiresAt()})
        fetchMock.mockImplementation(async () => {
            if (status === 'offline') throw new TypeError('offline')
            return json({error: 'refresh failed'}, status)
        })
        await expect(client.get('/api/users')).rejects.toBeDefined()
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(String(fetchMock.mock.calls[0][0])).toContain('/api/auth/refresh')
        const transient = status === 503 || status === 'offline'
        expect(store.refreshToken).toBe(transient ? 'r1' : null)
        expect(store.accessToken).toBe(transient ? token : null)
        expect(JSON.parse(localStorage.getItem('AuthStore')!).refreshToken).toBe(transient ? 'r1' : null)
        expect(client.getHeaderValue('Authorization')).toBe('')
    })
    it('loads public registration options through useAuth without renewing a stale session', async () => {
        useAuthStore().setSession({accessToken: jwt(-60), refreshToken: 'stale', refreshExpiresAt: expiresAt()})
        fetchMock.mockResolvedValue(json({tenantRequired: true}))
        const auth = app.runWithContext(() => useAuth())
        expect(await auth.registrationOptions()).toEqual({tenantRequired: true})
        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, init] = fetchMock.mock.calls[0]
        expect(String(url)).toBe('https://api.example.test/api/auth/registration-options')
        expect(new Headers(init?.headers).has('Authorization')).toBe(false)
    })
    it.each([false, true])('registers anonymously without refreshing a stale session (remembered=%s)', async remembered => {
        const token = jwt(-60)
        const store = useAuthStore()
        store.setSession({accessToken: token,
            ...(remembered ? {refreshToken: 'stale', refreshExpiresAt: expiresAt()} : {})})
        client.addHeader('Authorization', `Bearer ${token}`)
        fetchMock.mockResolvedValue(json({success: true, message: 'ok'}))
        const auth = app.runWithContext(() => useAuth())
        const form = {name: 'Name', username: 'user', email: 'user@example.test', password: 'Password42!', tenantName: 'Company'}
        expect(await auth.register(form)).toEqual({success: true, message: 'ok'})
        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, init] = fetchMock.mock.calls[0]
        expect(String(url)).toBe('https://api.example.test/api/users/register')
        expect(new Headers(init?.headers).has('Authorization')).toBe(false)
        expect(JSON.parse(String(init?.body))).toEqual(form)
        expect(store.accessToken).toBe(token)
        expect(store.refreshToken).toBe(remembered ? 'stale' : null)
        expect(client.getBaseHeaders().Authorization).toBe(`Bearer ${token}`)
    })
    it.each([false, true])('resends anonymously without refreshing or erasing shared headers (remembered=%s)', async remembered => {
        const token = jwt(-60)
        const store = useAuthStore()
        store.setSession({accessToken: token,
            ...(remembered ? {refreshToken: 'stale', refreshExpiresAt: expiresAt()} : {})})
        client.addHeader('Authorization', `Bearer ${token}`)
        client.addHeader('X-Tenant', 'tenant')
        const response = {success: true, message: 'If an account is pending verification, activation instructions will be sent.'}
        fetchMock.mockResolvedValue(json(response))
        const auth = app.runWithContext(() => useAuth())
        expect(await auth.resendVerificationEmail('pending@example.test')).toEqual(response)
        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, init] = fetchMock.mock.calls[0]
        expect(String(url)).toBe('https://api.example.test/api/users/verification/resend')
        expect(init?.method).toBe('POST')
        expect(JSON.parse(String(init?.body))).toEqual({email: 'pending@example.test'})
        expect(new Headers(init?.headers).has('Authorization')).toBe(false)
        expect(new Headers(init?.headers).get('X-Tenant')).toBe('tenant')
        expect(client.getBaseHeaders().Authorization).toBe(`Bearer ${token}`)
        expect(store.accessToken).toBe(token)
        expect(store.refreshToken).toBe(remembered ? 'stale' : null)
    })
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
        expect(requests[requests.length - 1].authorization).toBeNull()
        await router.push('/users')
        expect(router.currentRoute.value.name).toBe('Login')
        expect(useAuthStore().accessToken).toBeNull()
        expect(useAuthStore().authUser).toBeNull()
        expect(JSON.parse(localStorage.getItem('AuthStore')!).accessToken).toBeNull()
        expect(client.getHeaderValue('Authorization')).toBe('')
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
