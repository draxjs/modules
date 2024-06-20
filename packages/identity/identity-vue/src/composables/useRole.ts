import {inject, ref} from "vue";
import type {IRole, RoleSystem} from "@drax/identity-front";
import {ClientError} from "@drax/common-front";
import type { IClientInputError} from "@drax/common-front";


export function useRole() {

    const roleSystem = inject('RoleSystem') as RoleSystem

    let roleError = ref<string>('')
    let inputErrors = ref<IClientInputError>()
    let loading = ref(false);

    async function fetchPermissions(page = 1, perPage = 5) {
        loading.value = true
        let permissions = roleSystem.fetchPermissions()
        loading.value = false
        return permissions
    }

    async function fetchRole(page = 1, perPage = 5) {
        loading.value = true
        let roles = roleSystem.fetchRole()
        loading.value = false
        return roles
    }

    async function paginateRole(page = 1, perPage = 5) {
        loading.value = true
        let paginatedrole = roleSystem.paginateRole(page, perPage)
        loading.value = false
        return paginatedrole
    }

    async function createRole(roleData: IRole) {
        try {
            loading.value = true
            let role: IRole =  await roleSystem.createRole(roleData)
            return role
        } catch (err) {
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }if(err instanceof Error) {
                roleError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }

    }

    async function editRole(id: string, roleData: IRole) {
        try {
            loading.value = true
            let role: IRole = await roleSystem.editRole(id, roleData)
            return role
        } catch (err) {
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                roleError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    async function deleteRole(id: string) {
        try {
            loading.value = true
            await roleSystem.deleteRole(id)
        } catch (err) {
            console.log("composable deleteRole error: ", err, )
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                roleError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    return {fetchRole, fetchPermissions, paginateRole, createRole, editRole, deleteRole, loading, roleError, inputErrors}

}
