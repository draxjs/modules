import {inject, ref} from "vue";
import type {ITenant, TenantSystem} from "@drax/identity-front";
import {ClientError} from "@drax/common-front";
import type { IClientInputError} from "@drax/common-front";


export function useTenant() {

    const tenantSystem = inject('TenantSystem') as TenantSystem

    let tenantError = ref<string>('')
    let inputErrors = ref<IClientInputError>()
    let loading = ref(false);

    async function fetchTenant(page = 1, perPage = 5) {
        loading.value = true
        let tenants = tenantSystem.fetchTenant()
        loading.value = false
        return tenants
    }

    async function paginateTenant(page = 1, perPage = 5, string = "") {
        loading.value = true
        let paginatedtenant = tenantSystem.paginateTenant(page, perPage,string)
        loading.value = false
        return paginatedtenant
    }

    async function createTenant(tenantData: ITenant) {
        try {
            loading.value = true
            let tenant: ITenant =  await tenantSystem.createTenant(tenantData)
            return tenant
        } catch (err) {
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }if(err instanceof Error) {
                tenantError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }

    }

    async function editTenant(id: string, tenantData: ITenant) {
        try {
            loading.value = true
            let tenant: ITenant = await tenantSystem.editTenant(id, tenantData)
            return tenant
        } catch (err) {

            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                tenantError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    async function deleteTenant(id: string) {
        try {
            loading.value = true
            await tenantSystem.deleteTenant(id)
        } catch (err) {
            console.log("composable deleteTenant error: ", err, )
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                tenantError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    return {fetchTenant,  paginateTenant, createTenant, editTenant, deleteTenant, loading, tenantError, inputErrors}

}
