import {useAuthStore} from "../stores/auth/AuthStore";
import {ref, computed, inject} from "vue";
import type AuthSystem from "@/core/system/AuthSystem";

export function useIdentityLogin() {

    const authStore = useAuthStore()
    const authSystem = inject('AuthSystem') as AuthSystem

    // Define reactive variables for form inputs
    const username = ref('')
    const password = ref('')
    const authError = ref('')

// Compute whether the form is valid (both username and password are not empty)
    const isFormValid = computed(() => username.value.trim() !== '' && password.value.trim() !== '')

// Function to handle form submission
    const submitLogin = async () => {
        console.log('Submitting:', {username: username.value, password: password.value})
        try {
            const {accessToken} = await authSystem.login(username.value, password.value)
            authStore.setAccessToken(accessToken)
            console.log("accessToken", accessToken)
            const authUser = await authSystem.me()
            console.log("AuthUser", authUser)
            authStore.setAuthUser(authUser)
        } catch (e) {
            console.error(e)
            const error = e as Error
            authError.value = error.message
        }

    }


    return {username, password, isFormValid, submitLogin: submitLogin, authError}

}
