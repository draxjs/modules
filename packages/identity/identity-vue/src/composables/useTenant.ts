import {inject, ref} from "vue";
import type {ITenant, ITenantBase} from "@drax/identity-share";
import type { TenantSystem} from "@drax/identity-front";
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

    async function paginateTenant({page= 1, limit= 5, orderBy="", orderDesc=false, search = ""}) {
        loading.value = true
        let paginatedtenant = tenantSystem.paginate({page, limit, orderBy, orderDesc, search})
        loading.value = false
        return paginatedtenant
    }

    async function createTenant(tenantData: ITenantBase) {
        try {
            loading.value = true
            let tenant: ITenant =  await tenantSystem.create(tenantData)
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

    async function editTenant(id: string, tenantData: ITenantBase) {
        try {
            loading.value = true
            let tenant: ITenant = await tenantSystem.update(id, tenantData)
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
            await tenantSystem.delete(id)
        } catch (err) {
            console.log("composable delete error: ", err, )
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
