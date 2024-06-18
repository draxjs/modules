import {useAuthStore} from "../stores/auth/AuthStore";
import {AuthHelper, AuthSystem} from "@drax/identity-front";
import {inject} from "vue";

export function useAuth() {

    const authStore = useAuthStore()

    const authSystem = inject('AuthSystem') as AuthSystem

    async function fetchAuthUser() {
        const authUser =  await authSystem.me()
        authStore.setAuthUser(authUser)
        return authUser
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
            authStore.clearAuth()
            return false
        }

    }

    return {hasPermission, tokenIsValid, isAuthenticated, fetchAuthUser}

}
