import {useAuthStore} from "../stores/AuthStore";
import {AuthHelper, AuthSystemFactory} from "@drax/identity-front";
import type {AuthSystem, ILoginResponse} from "@drax/identity-front";
import {useRouter} from 'vue-router'
import {authSessionRevision, clearAuthSession, isCurrentAuthOperation, isCurrentAuthSession, isRememberMeEnabled, rereadSession, revokeSessionToken, syncAuthHeaders} from './setupAuthSession'

export function useAuth() {

    const authStore = useAuthStore()
    const router = useRouter()

    const authSystem: AuthSystem = AuthSystemFactory.getInstance()

    /** Start the external credential exchange inside operation so logout/new login can cancel its result. */
    const loginWithSession = async (operation: (rememberMe: boolean) => Promise<ILoginResponse>, rememberMe = false) => {
        clearAuthSession(authStore)
        const revision = authSessionRevision(authStore)
        const version = authStore.sessionVersion
        const remembered = isRememberMeEnabled() && rememberMe
        const result = await operation(remembered)
        if (authSessionRevision(authStore) !== revision || !isCurrentAuthOperation(authStore, version)) {
            syncAuthHeaders(authStore)
            if (result.refreshToken) await revokeSessionToken(result.refreshToken).catch(() => {})
            throw new Error('Authentication cancelled')
        }
        if (remembered) authStore.setSession(result)
        else authStore.setAccessToken(result.accessToken)
        // A server returning refresh credentials without opt-in must not leave an orphan session.
        if (!remembered && result.refreshToken) void revokeSessionToken(result.refreshToken).catch(() => {})
        syncAuthHeaders(authStore)
        try {
            await fetchAuthUser()
            if (authSessionRevision(authStore) !== revision || !isCurrentAuthOperation(authStore, version)) throw new Error('Authentication cancelled')
        } catch (error) {
            if (authSessionRevision(authStore) === revision && isCurrentAuthOperation(authStore, version)) {
                const token = authStore.refreshToken
                clearAuthSession(authStore)
                if (token) await revokeSessionToken(token).catch(() => {})
            } else if (result.refreshToken) {
                await revokeSessionToken(result.refreshToken).catch(() => {})
            }
            throw error
        }
    }

    const login = async (username: string, password: string, rememberMe = false) => {
        await loginWithSession(remembered => remembered
            ? authSystem.login(username, password, true)
            : authSystem.login(username, password), rememberMe)
    }

    const switchTenant = async (tenantId: string) => {
        const {accessToken} = await authSystem.switchTenant(tenantId)
        // Switching tenant replaces the JWT, but must not turn an ordinary session into a remembered one.
        authStore.setSession({accessToken, refreshToken: authStore.refreshToken ?? undefined,
            refreshExpiresAt: authStore.refreshExpiresAt ?? undefined})
        syncAuthHeaders(authStore)
        await fetchAuthUser()
    }

    const loginWithToken = async (token: string) => {
        clearAuthSession(authStore)
        authStore.setAccessToken(token)
        const version = authStore.sessionVersion
        syncAuthHeaders(authStore)
        try {
            if(tokenIsValid()) await fetchAuthUser()
            else clearAuthSession(authStore)
        } catch (error) {
            if (isCurrentAuthSession(authStore, token, version)) clearAuthSession(authStore)
            throw error
        }

    }

    const changeOwnPassword = async (currentPassword: string, newPassword: string) => {
        return await authSystem.changeOwnPassword(currentPassword, newPassword)
    }

    const passwordPolicy = async () => {
        return await authSystem.passwordPolicy()
    }

    const recoveryPasswordRequest = async (email: string) => {
        return await authSystem.recoveryPasswordRequest(email)
    }

    const recoveryPasswordComplete = async (recoveryCode: string, newPassword: string) => {
        return await authSystem.recoveryPasswordComplete(recoveryCode, newPassword)
    }

    const registrationOptions = async () => {
        return await authSystem.registrationOptions()
    }

    const resendVerificationEmail = async (email: string) => {
        return await authSystem.resendVerificationEmail(email)
    }

    const register = async (form: any) => {
        return await authSystem.register(form)
    }

    const changeAvatar = async (file: File) => {
        if (file) {
            await authSystem.changeAvatar(file)
            await fetchAuthUser()
            return
        }

    }

    async function fetchAuthUser() {
        const revision = authSessionRevision(authStore)
        const token = authStore.accessToken
        const version = authStore.sessionVersion
        const authUser = await authSystem.me()
        if (authSessionRevision(authStore) === revision && isCurrentAuthSession(authStore, token, version)) {
            authStore.setAuthUser(authUser)
        }
        return authUser
    }

    async function logout() {
        rereadSession(authStore)
        const token = authStore.refreshToken
        clearAuthSession(authStore)
        authSystem.logout()
        // Clear and navigate immediately, even offline or with a refresh in flight.
        const navigation = router.push({name: 'Login'})
        try {
            if (token) await revokeSessionToken(token)
        } catch {
            // Local logout must succeed even when server revocation is unavailable.
        } finally {
            await navigation
        }
    }

    function hasPermission(permission: string | undefined) {
        if(permission === undefined){
            return false
        }
        return authStore?.authUser?.role?.permissions ? authStore.authUser.role.permissions.includes(permission) : false
    }

    function tokenIsValid() {
        return authStore.accessToken ? AuthHelper.isJWTValid(authStore.accessToken) : false
    }

    function isAuthenticated() {
        if (authStore.authUser && tokenIsValid()) {
            return true
        } else {
            return false
        }

    }

    return {
        login, logout, loginWithToken, loginWithSession,
        tokenIsValid, hasPermission,
        isAuthenticated, fetchAuthUser,
        changeOwnPassword, changeAvatar, passwordPolicy,
        recoveryPasswordRequest, recoveryPasswordComplete,
        register, registrationOptions, resendVerificationEmail, switchTenant
    }

}
