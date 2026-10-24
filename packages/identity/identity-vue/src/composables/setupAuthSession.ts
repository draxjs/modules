import {HttpRestClientFactory} from '@drax/common-front'
import {AuthHelper, AuthSystemFactory} from '@drax/identity-front'
import {useAuthStore} from '../stores/AuthStore'

export const isRememberMeEnabled = () => import.meta.env.VITE_DRAX_REMEMBER_ME_ENABLED === 'true'

type AuthStore = ReturnType<typeof useAuthStore>
const flights = new WeakMap<AuthStore, Promise<void>>()
const fetchingUser = new WeakSet<AuthStore>()
const lockName = 'drax-auth-session'
const revisions = new WeakMap<AuthStore, number>()
export const authSessionRevision = (store = useAuthStore()) => revisions.get(store) ?? 0

export function syncAuthHeaders(store = useAuthStore()) {
    store.syncAuthHeaders()
}

export function clearAuthSession(store = useAuthStore()) {
    revisions.set(store, authSessionRevision(store) + 1)
    store.clearAuth()
    syncAuthHeaders(store)
}

export function isRejectedCredential(error: unknown): boolean {
    const e = error as {statusCode?: number, status?: number, response?: {status?: number}, cause?: unknown, error?: unknown}
    const status = e?.statusCode ?? e?.status ?? e?.response?.status
    return status === 401 || status === 403 || status === 498 ||
        (!!e?.error && e.error !== error && isRejectedCredential(e.error)) ||
        (!!e?.cause && e.cause !== error && isRejectedCredential(e.cause))
}

function readPersisted() {
    try {
        const raw = localStorage.getItem('AuthStore')
        return raw ? JSON.parse(raw) as AuthStore['$state'] : null
    } catch { return null }
}

export function rereadSession(store: AuthStore) {
    const persisted = readPersisted()
    if (persisted) {
        store.$patch({
            accessToken: persisted.accessToken ?? null,
            sessionVersion: persisted.sessionVersion ?? null,
            refreshToken: persisted.refreshToken ?? null,
            refreshExpiresAt: persisted.refreshExpiresAt ?? null,
            authUser: persisted.authUser ?? null,
        })
        syncAuthHeaders(store)
    }
}

export function isCurrentAuthOperation(store: AuthStore, version: string | null) {
    if (store.sessionVersion !== version) return false
    const persisted = readPersisted()
    // Missing versions in legacy persisted stores represent the initial epoch.
    if (persisted && (persisted.sessionVersion ?? null) !== version) {
        rereadSession(store)
        return false
    }
    return true
}

export function isCurrentAuthSession(store: AuthStore, token: string | null, version = store.sessionVersion) {
    if (!isCurrentAuthOperation(store, version) || store.accessToken !== token) return false
    const persisted = readPersisted()
    if (persisted && (persisted.accessToken !== token || (persisted.refreshToken ?? null) !== store.refreshToken)) {
        rereadSession(store)
        return false
    }
    return true
}

function needsRefresh(token: string | null) {
    return !AuthHelper.isJWTValid(token ?? '', 30)
}

async function withSessionLock(action: () => Promise<void>) {
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
        await navigator.locks.request(lockName, action)
    } else {
        await action()
    }
}

export async function revokeSessionToken(token: string) {
    await AuthSystemFactory.getInstance().revokeSession(token)
}

async function fetchSessionUser(store: AuthStore) {
    const token = store.accessToken
    const revision = authSessionRevision(store)
    const version = store.sessionVersion
    fetchingUser.add(store)
    try {
        const user = await AuthSystemFactory.getInstance().me()
        if (authSessionRevision(store) === revision && isCurrentAuthSession(store, token, version)) store.setAuthUser(user)
    } catch (error) {
        if (authSessionRevision(store) === revision && isCurrentAuthSession(store, token, version) && isRejectedCredential(error)) {
            clearAuthSession(store)
            throw error
        }
        // A profile fetch failing offline must not discard successfully rotated credentials.
    } finally {
        fetchingUser.delete(store)
    }
}

export function refreshAuthSession(store = useAuthStore()): Promise<void> {

    const running = flights.get(store)
    if (running) return running
    const flight = withSessionLock(async () => {
        rereadSession(store)
        const valid = AuthHelper.isJWTValid(store.accessToken ?? '')
        if (!isRememberMeEnabled() || !store.refreshToken) {
            if (!valid) {
                if (store.accessToken || store.refreshToken || store.refreshExpiresAt || store.authUser) clearAuthSession(store)
                else syncAuthHeaders(store)
            } else {
                // Disabling remember-me must not invalidate an otherwise live ordinary JWT.
                if (!isRememberMeEnabled() && (store.refreshToken || store.refreshExpiresAt)) {
                    store.setAccessToken(store.accessToken!)
                }
                syncAuthHeaders(store)
            }
            return
        }
        if (!needsRefresh(store.accessToken)) {
            if (!store.authUser) await fetchSessionUser(store)
            return
        }
        const token = store.refreshToken
        const accessToken = store.accessToken
        const version = store.sessionVersion
        if (store.refreshExpiresAt && Date.parse(store.refreshExpiresAt) <= Date.now()) {
            clearAuthSession(store)
            return
        }
        try {
            const result = await AuthSystemFactory.getInstance().refresh(token)
            // Logout or a new login may have happened while the request was in flight.
            if (!isCurrentAuthSession(store, accessToken, version) || store.refreshToken !== token) {
                syncAuthHeaders(store)
                if (result.refreshToken) await revokeSessionToken(result.refreshToken).catch(() => {})
                return
            }
            store.setSession(result)
            syncAuthHeaders(store)
            await fetchSessionUser(store)
        } catch (error) {
            if (isCurrentAuthSession(store, accessToken, version) && store.refreshToken === token && isRejectedCredential(error)) {
                clearAuthSession(store)
            }
            throw error
        }
    }).finally(() => { flights.delete(store) })
    flights.set(store, flight)
    return flight
}

/** Call after installing Pinia, before installing the router. No component/router context required. */
export async function setupAuthSession(): Promise<void> {
    const store = useAuthStore()
    const client = HttpRestClientFactory.getInstance() as ReturnType<typeof HttpRestClientFactory.getInstance> & {
        setBeforeRequest?: (handler: (url: string) => Promise<void>) => void
    }
    syncAuthHeaders(store)
    client.setBeforeRequest?.(async (url) => {
        if (/\/api\/auth\/(login|refresh|logout|registration-options)\/?(?:[?#]|$)/.test(url)) return
        if (/\/api\/users\/(register|verification\/resend)\/?(?:[?#]|$)/.test(url)) return
        // The profile fetch uses the fresh JWT and must not await its own refresh promise.
        if (fetchingUser.has(store) && /\/api\/auth\/me\/?(?:[?#]|$)/.test(url)) return
        await refreshAuthSession(store)
    })
    try {
        await refreshAuthSession(store)
    } catch {
        // Offline startup must not destroy a recoverable remembered session.
        return
    }
    if (!store.accessToken || !store.tokenIsValid()) return
    // Remembered maintenance already fetched (or attempted) the missing profile.
    // Do not immediately retry a transient failure in this same setup invocation.
    if (isRememberMeEnabled() && store.refreshToken) return
    try {
        await fetchSessionUser(store)
    } catch { /* Rejected credentials have already been cleared. */ }
}
