import {useAuthStore} from "../stores/auth/AuthStore";
import {AuthHelper, AuthSystemFactory} from "@drax/identity-front";
import type {AuthSystem} from "@drax/identity-front";
import {useRouter} from 'vue-router'

export function useAuth() {

    const authStore = useAuthStore()
    const router = useRouter()

    const authSystem: AuthSystem = AuthSystemFactory.getInstance()

    const login = async (username: string, password: string) => {
        const {accessToken} = await authSystem.login(username, password)
        authStore.setAccessToken(accessToken)
        const authUser = await authSystem.me()
        authStore.setAuthUser(authUser)
    }

    const loginWithToken = async (token: string) => {
        authStore.setAccessToken(token)
        if(tokenIsValid()){
            const authUser = await authSystem.me()
            authStore.setAuthUser(authUser)
        }

    }

    const changeOwnPassword = async (currentPassword: string, newPassword: string) => {
        return await authSystem.changeOwnPassword(currentPassword, newPassword)
    }

    const recoveryPasswordRequest = async (email: string) => {
        return await authSystem.recoveryPasswordRequest(email)
    }

    const recoveryPasswordComplete = async (recoveryCode: string, newPassword: string) => {
        return await authSystem.recoveryPasswordComplete(recoveryCode, newPassword)
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
        const authUser = await authSystem.me()
        authStore.setAuthUser(authUser)
        return authUser
    }

    function logout() {
        clearAuth()
        router.push({name: 'Login'})
    }

    function clearAuth(){
        authSystem.logout()
        authStore.clearAuth()
    }

    function hasPermission(permission: string) {
        return authStore?.authUser?.role?.permissions ? authStore.authUser.role.permissions.includes(permission) : false
    }

    function tokenIsValid() {
        return authStore.accessToken ? AuthHelper.isJWTValid(authStore.accessToken) : false
    }

    function isAuthenticated() {
        if (tokenIsValid()) {
            return true
        } else {
            clearAuth()
            return false
        }

    }

    return {
        login, logout, loginWithToken,
        tokenIsValid, hasPermission,
        isAuthenticated, fetchAuthUser,
        changeOwnPassword, changeAvatar,
        recoveryPasswordRequest, recoveryPasswordComplete,
        register
    }

}
