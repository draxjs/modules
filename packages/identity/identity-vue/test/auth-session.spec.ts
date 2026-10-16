import {beforeEach, describe, expect, it, vi} from 'vitest'
import {createPinia, setActivePinia} from 'pinia'
import {useAuthStore} from '../src/stores/AuthStore'
import {clearAuthSession, refreshAuthSession, setupAuthSession} from '../src/composables/setupAuthSession'
import {useAuth} from '../src/composables/useAuth'

const mocks = vi.hoisted(() => ({
    client: {addHeader: vi.fn(), removeHeader: vi.fn(), setBeforeRequest: vi.fn()},
    auth: {login: vi.fn(), refresh: vi.fn(), revokeSession: vi.fn(), logout: vi.fn(), me: vi.fn()},
    push: vi.fn(),
}))
vi.mock('@drax/common-front', () => ({
    HttpClientFactory: {getInstance: () => mocks.client},
    HttpRestClientFactory: {getInstance: () => mocks.client},
}))
vi.mock('@drax/identity-front', () => ({
    AuthSystemFactory: {getInstance: () => mocks.auth},
    AuthHelper: {isJWTValid: (token: string) => JSON.parse(atob(token.split('.')[1])).exp * 1000 > Date.now()},
}))
vi.mock('vue-router', () => ({useRouter: () => ({push: mocks.push})}))

const jwt = (seconds: number) => `e30.${btoa(JSON.stringify({exp: Math.floor(Date.now() / 1000) + seconds}))}.sig`
const user = {username: 'test', role: {permissions: []}}
const remembered = () => ({accessToken: jwt(-1), refreshToken: 'r1', refreshExpiresAt: new Date(Date.now() + 86400000).toISOString()})
function deferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>(r => {resolve = r})
    return {promise, resolve}
}

beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', 'true')
    vi.stubGlobal('navigator', {})
    mocks.auth.me.mockResolvedValue(user)
    mocks.auth.revokeSession.mockResolvedValue(undefined)
    mocks.push.mockResolvedValue(undefined)
})

describe('AuthStore', () => {
    it('persists rotation and clears remember-me for ordinary/token login', () => {
        const store = useAuthStore()
        store.setSession(remembered())
        expect(JSON.parse(localStorage.getItem('AuthStore')!).refreshToken).toBe('r1')
        store.setAccessToken(jwt(60))
        expect(store.refreshToken).toBeNull()
        expect(store.refreshExpiresAt).toBeNull()
        store.setSession(remembered())
        store.clearAuth()
        expect(JSON.parse(localStorage.getItem('AuthStore')!)).toMatchObject({accessToken: null, refreshToken: null, refreshExpiresAt: null, authUser: null})
    })
})

describe('setup / refresh', () => {
    it('hydrates and renews a legacy store without a sessionVersion', async () => {
        const legacy = {...remembered(), authUser: null}
        localStorage.setItem('AuthStore', JSON.stringify(legacy))
        mocks.auth.refresh.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r2'})
        await setupAuthSession()
        expect(useAuthStore().sessionVersion).toBeNull()
        expect(useAuthStore().refreshToken).toBe('r2')
        expect(useAuthStore().authUser).toEqual(user)
        useAuthStore().clearAuth()
        expect(typeof useAuthStore().sessionVersion).toBe('string')
    })
    it('single-flights concurrent requests, rotates storage and headers', async () => {
        const store = useAuthStore()
        store.setSession(remembered())
        const next = {accessToken: jwt(600), refreshToken: 'r2', refreshExpiresAt: remembered().refreshExpiresAt}
        mocks.auth.refresh.mockResolvedValue(next)
        await Promise.all([refreshAuthSession(), refreshAuthSession(), refreshAuthSession()])
        expect(mocks.auth.refresh).toHaveBeenCalledTimes(1)
        expect(mocks.auth.refresh).toHaveBeenCalledWith('r1')
        expect(store.refreshToken).toBe('r2')
        expect(JSON.parse(localStorage.getItem('AuthStore')!).refreshToken).toBe('r2')
        expect(mocks.client.addHeader).toHaveBeenLastCalledWith('Authorization', `Bearer ${next.accessToken}`)
    })

    it.each(['false', undefined])('does not refresh with flag %s', async flag => {
        vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', flag)
        useAuthStore().setSession(remembered())
        await refreshAuthSession()
        expect(mocks.auth.refresh).not.toHaveBeenCalled()
    })

    it('does not extend ordinary sessions', async () => {
        useAuthStore().setAccessToken(jwt(-1))
        await setupAuthSession()
        expect(mocks.auth.refresh).not.toHaveBeenCalled()
        expect(mocks.auth.me).not.toHaveBeenCalled()
    })

    it('renews near expiration, but not a fresh JWT', async () => {
        const store = useAuthStore()
        store.setSession({...remembered(), accessToken: jwt(600)})
        await refreshAuthSession()
        expect(mocks.auth.refresh).not.toHaveBeenCalled()
        store.setSession({...remembered(), accessToken: jwt(15)})
        mocks.auth.refresh.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r2'})
        await refreshAuthSession()
        expect(mocks.auth.refresh).toHaveBeenCalledOnce()
    })

    it('retains tokens on transient errors, clears on wrapped rejected credentials', async () => {
        const store = useAuthStore()
        store.setSession(remembered())
        mocks.auth.refresh.mockRejectedValue(new TypeError('offline'))
        await expect(refreshAuthSession()).rejects.toThrow('offline')
        expect(store.refreshToken).toBe('r1')
        mocks.auth.refresh.mockRejectedValue({error: {statusCode: 401}})
        await expect(refreshAuthSession()).rejects.toEqual({error: {statusCode: 401}})
        expect(store.accessToken).toBeNull()
        expect(mocks.client.removeHeader).toHaveBeenCalledWith('Authorization')
    })

    it('clears an expired refresh credential without calling refresh', async () => {
        useAuthStore().setSession({...remembered(), refreshExpiresAt: new Date(0).toISOString()})
        await refreshAuthSession()
        expect(useAuthStore().refreshToken).toBeNull()
        expect(mocks.auth.refresh).not.toHaveBeenCalled()
    })

    it('rereads persisted rotation inside the cross-tab Web Lock', async () => {
        const store = useAuthStore()
        store.setSession(remembered())
        const request = vi.fn(async (_name, action) => {
            localStorage.setItem('AuthStore', JSON.stringify({...store.$state, accessToken: jwt(600), refreshToken: 'other-tab'}))
            await action()
        })
        vi.stubGlobal('navigator', {locks: {request}})
        await refreshAuthSession()
        expect(request).toHaveBeenCalledOnce()
        expect(mocks.auth.refresh).not.toHaveBeenCalled()
        expect(store.refreshToken).toBe('other-tab')
    })

    it('does not resurrect logout during refresh, and revokes the rotated credential', async () => {
        const store = useAuthStore()
        store.setSession(remembered())
        const pending = deferred<any>()
        mocks.auth.refresh.mockReturnValue(pending.promise)
        const refresh = refreshAuthSession()
        await useAuth().logout()
        pending.resolve({accessToken: jwt(600), refreshToken: 'late-r2'})
        await refresh
        expect(store.accessToken).toBeNull()
        expect(store.refreshToken).toBeNull()
        expect(mocks.auth.revokeSession).toHaveBeenCalledWith('r1')
        expect(mocks.auth.revokeSession).toHaveBeenCalledWith('late-r2')
    })

    it('observes cross-tab logout while a refresh is running', async () => {
        const store = useAuthStore()
        store.setSession(remembered())
        const pending = deferred<any>()
        mocks.auth.refresh.mockReturnValue(pending.promise)
        const refresh = refreshAuthSession()
        localStorage.setItem('AuthStore', JSON.stringify({accessToken: null, refreshToken: null, authUser: null}))
        pending.resolve({accessToken: jwt(600), refreshToken: 'late-r2'})
        await refresh
        expect(store.accessToken).toBeNull()
    })

    it('restores expired JWT before me; preflight skips auth endpoints without recursion', async () => {
        useAuthStore().setSession(remembered())
        mocks.auth.refresh.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r2'})
        await setupAuthSession()
        expect(useAuthStore().authUser).toEqual(user)
        const hook = mocks.client.setBeforeRequest.mock.calls[0][0]
        useAuthStore().setSession(remembered())
        for (const endpoint of ['login', 'refresh', 'logout']) await hook(`https://host/api/auth/${endpoint}?x=1`)
        expect(mocks.auth.refresh).toHaveBeenCalledTimes(1)
        await hook('/api/users')
        expect(mocks.auth.refresh).toHaveBeenCalledTimes(2)
    })

    it('fetches me after rotation without preflight recursion', async () => {
        await setupAuthSession()
        const hook = mocks.client.setBeforeRequest.mock.calls[0][0]
        useAuthStore().setSession(remembered())
        mocks.auth.refresh.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r2'})
        mocks.auth.me.mockImplementation(async () => {
            await hook('/api/auth/me')
            return user
        })
        await hook('/api/users')
        expect(mocks.auth.refresh).toHaveBeenCalledOnce()
        expect(useAuthStore().authUser).toEqual(user)
    })

    it('does not overwrite cross-tab logout when a refreshed profile arrives late', async () => {
        const store = useAuthStore()
        store.setSession(remembered())
        mocks.auth.refresh.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r2'})
        mocks.auth.me.mockImplementation(async () => {
            localStorage.setItem('AuthStore', JSON.stringify({accessToken: null, refreshToken: null, authUser: null}))
            return user
        })
        await refreshAuthSession()
        expect(store.accessToken).toBeNull()
        expect(store.authUser).toBeNull()
    })

    it('retains rotated credentials if me fails offline, but clears when me rejects credentials', async () => {
        const store = useAuthStore()
        store.setSession(remembered())
        mocks.auth.refresh.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r2'})
        mocks.auth.me.mockRejectedValue(new Error('offline'))
        await refreshAuthSession()
        expect(store.refreshToken).toBe('r2')
        store.setSession(remembered())
        mocks.auth.me.mockRejectedValue({error: {statusCode: 401}})
        await expect(refreshAuthSession()).rejects.toEqual({error: {statusCode: 401}})
        expect(store.refreshToken).toBeNull()
    })

    it('works with a shared client that has not implemented the optional hook yet', async () => {
        const hook = mocks.client.setBeforeRequest
        Object.assign(mocks.client, {setBeforeRequest: undefined})
        try {
            useAuthStore().setSession(remembered())
            mocks.auth.refresh.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r2'})
            await setupAuthSession()
            expect(useAuthStore().refreshToken).toBe('r2')
        } finally {
            mocks.client.setBeforeRequest = hook
        }
    })

    it('startup tolerates offline refresh without erasing persistence', async () => {
        useAuthStore().setSession(remembered())
        mocks.auth.refresh.mockRejectedValue(new Error('offline'))
        await setupAuthSession()
        expect(useAuthStore().refreshToken).toBe('r1')
    })
})

describe('useAuth', () => {
    it('opts in only when enabled and selected, keeping two-argument mock compatibility', async () => {
        const auth = useAuth()
        mocks.auth.login.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r1', refreshExpiresAt: remembered().refreshExpiresAt})
        await auth.login('user', 'password')
        expect(mocks.auth.login).toHaveBeenLastCalledWith('user', 'password')
        expect(useAuthStore().refreshToken).toBeNull()
        await auth.login('user', 'password', true)
        expect(mocks.auth.login).toHaveBeenLastCalledWith('user', 'password', true)
        expect(useAuthStore().refreshToken).toBe('r1')
        vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', 'false')
        await auth.login('user', 'password', true)
        expect(mocks.auth.login).toHaveBeenLastCalledWith('user', 'password')
        expect(useAuthStore().refreshToken).toBeNull()
    })

    it('cleans up and revokes a remembered login when me fails', async () => {
        mocks.auth.login.mockResolvedValue({accessToken: jwt(600), refreshToken: 'r1'})
        mocks.auth.me.mockRejectedValue(new Error('me failed'))
        await expect(useAuth().login('u', 'p', true)).rejects.toThrow('me failed')
        expect(useAuthStore().accessToken).toBeNull()
        expect(mocks.auth.revokeSession).toHaveBeenCalledWith('r1')
    })

    it('clears remember-me on token login and applies access headers', async () => {
        useAuthStore().setSession(remembered())
        const token = jwt(600)
        await useAuth().loginWithToken(token)
        expect(useAuthStore().refreshToken).toBeNull()
        expect(mocks.client.addHeader).toHaveBeenLastCalledWith('Authorization', `Bearer ${token}`)
    })

    it('logout revokes the latest credential persisted by another tab', async () => {
        const store = useAuthStore()
        store.setSession(remembered())
        localStorage.setItem('AuthStore', JSON.stringify({...store.$state, accessToken: jwt(600), refreshToken: 'other-tab-r2'}))
        await useAuth().logout()
        expect(mocks.auth.revokeSession).toHaveBeenCalledWith('other-tab-r2')
        expect(store.accessToken).toBeNull()
    })

    it('logout succeeds locally even if revocation fails', async () => {
        useAuthStore().setSession(remembered())
        mocks.auth.revokeSession.mockRejectedValue(new Error('offline'))
        await useAuth().logout()
        expect(useAuthStore().accessToken).toBeNull()
        expect(mocks.push).toHaveBeenCalledWith({name: 'Login'})
    })

    it.each([false, true])('rejects pending login after cross-tab null-to-null logout (rememberMe=%s)', async rememberMe => {
        const store = useAuthStore()
        const auth = useAuth()
        const pending = deferred<any>()
        mocks.auth.login.mockReturnValue(pending.promise)
        const login = auth.login('u', 'p', rememberMe)
        const loginVersion = store.sessionVersion
        const otherTab = useAuthStore(createPinia())
        otherTab.clearAuth()
        expect(otherTab.sessionVersion).not.toBe(loginVersion)
        const logoutVersion = otherTab.sessionVersion
        pending.resolve({accessToken: jwt(600), refreshToken: 'late-cross-tab'})
        await expect(login).rejects.toThrow('cancelled')
        expect(store.accessToken).toBeNull()
        expect(store.authUser).toBeNull()
        expect(store.sessionVersion).toBe(logoutVersion)
        expect(JSON.parse(localStorage.getItem('AuthStore')!).sessionVersion).toBe(logoutVersion)
        expect(mocks.auth.revokeSession).toHaveBeenCalledWith('late-cross-tab')
    })

    it('does not overwrite a newer cross-tab login with a pending login result', async () => {
        const store = useAuthStore()
        const pending = deferred<any>()
        mocks.auth.login.mockReturnValue(pending.promise)
        const login = useAuth().login('u', 'p', true)
        const otherTab = useAuthStore(createPinia())
        otherTab.clearAuth()
        otherTab.setSession({accessToken: jwt(900), refreshToken: 'new-login'})
        const nextVersion = otherTab.sessionVersion
        pending.resolve({accessToken: jwt(600), refreshToken: 'stale-login'})
        await expect(login).rejects.toThrow('cancelled')
        expect(store.refreshToken).toBe('new-login')
        expect(store.sessionVersion).toBe(nextVersion)
        expect(mocks.auth.revokeSession).toHaveBeenCalledWith('stale-login')
    })

    it('ignores late token-login profile even when another tab logs in with the same JWT', async () => {
        const store = useAuthStore()
        const token = jwt(600)
        const me = deferred<any>()
        mocks.auth.me.mockReturnValue(me.promise)
        const login = useAuth().loginWithToken(token)
        const firstVersion = store.sessionVersion
        const otherTab = useAuthStore(createPinia())
        otherTab.clearAuth()
        otherTab.setAccessToken(token)
        me.resolve(user)
        await login
        expect(store.sessionVersion).not.toBe(firstVersion)
        expect(store.authUser).toBeNull()
        expect(JSON.parse(localStorage.getItem('AuthStore')!).authUser).toBeNull()
    })

    it('does not apply a pending login or me after logout', async () => {
        const pending = deferred<any>()
        mocks.auth.login.mockReturnValue(pending.promise)
        const login = useAuth().login('u', 'p', true)
        await useAuth().logout()
        pending.resolve({accessToken: jwt(600), refreshToken: 'late-login'})
        await expect(login).rejects.toThrow('cancelled')
        expect(useAuthStore().accessToken).toBeNull()
        expect(mocks.auth.revokeSession).toHaveBeenCalledWith('late-login')
        useAuthStore().setSession({accessToken: jwt(600), refreshToken: 'r1'})
        const me = deferred<any>()
        mocks.auth.me.mockReturnValue(me.promise)
        const fetch = useAuth().fetchAuthUser()
        clearAuthSession()
        me.resolve(user)
        await fetch
        expect(useAuthStore().authUser).toBeNull()
    })
})
