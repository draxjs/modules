import {useAuthStore} from "../stores/auth/AuthStore";
import {AuthHelper, AuthSystem} from "@drax/identity-front";
import {inject} from "vue";

export function useAuth() {

    const authStore = useAuthStore()

    const authSystem = inject('AuthSystem') as AuthSystem

    const login = async (username:string, password:string) => {
            const {accessToken} = await authSystem.login(username, password)
            authStore.setAccessToken(accessToken)
            const authUser = await authSystem.me()
            authStore.setAuthUser(authUser)
    }

    const changeOwnPassword = async (currentPassword:string, newPassword:string) => {
        return  await authSystem.changeOwnPassword(currentPassword, newPassword)
    }

    async function fetchAuthUser() {
        const authUser =  await authSystem.me()
        authStore.setAuthUser(authUser)
        return authUser
    }

    function logout(){
        authSystem.logout()
        authStore.clearAuth()
    }

    function hasPermission(permission:string) {
        return authStore?.authUser?.role?.permissions ? authStore.authUser.role.permissions.includes(permission) : false
    }

    function tokenIsValid(){
        return authStore.accessToken ? AuthHelper.isJWTValid(authStore.accessToken) : false
    }

    function isAuthenticated(){
        if(tokenIsValid()){
            return true
        }else{
            logout()
            return false
        }

    }

    return {hasPermission, logout, tokenIsValid, isAuthenticated, fetchAuthUser, login, changeOwnPassword}

}
