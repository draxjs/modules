import {ref} from "vue";
import type {RoleSystem} from "@drax/identity-front";
import {RoleSystemFactory} from "@drax/identity-front";
import type {IRole, IRoleBase} from "@drax/identity-share";
import {ClientError} from "@drax/common-front";
import type {IClientInputError} from "@drax/common-front";
import type {IDraxPaginateOptions} from "@drax/crud-share";


export function useRole() {

    const roleSystem: RoleSystem = RoleSystemFactory.getInstance()

    let roleError = ref<string>('')
    let inputErrors = ref<IClientInputError>()
    let loading = ref(false);

    async function fetchPermissions(page = 1, perPage = 5) {
        loading.value = true
        let permissions = await roleSystem.fetchPermissions()
        loading.value = false
        return permissions
    }

    async function fetchRole(page = 1, perPage = 5) {
        try {
            loading.value = true
            let roles = await roleSystem.fetchRole()
            return roles
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    async function paginateRole({page = 1, limit = 5, orderBy = "", order = "asc", search = ""}: IDraxPaginateOptions) {
        try {
            loading.value = true
            let paginatedrole = await roleSystem.paginate({page, limit, orderBy, order, search})
            return paginatedrole
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    async function createRole(roleData: IRoleBase) {
        try {
            loading.value = true
            let role: IRole = await roleSystem.create(roleData)
            return role
        } catch (err) {
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if (err instanceof Error) {
                roleError.value = err.message
            }
            throw err
        } finally {
            loading.value = false
        }

    }

    async function editRole(id: string, roleData: IRoleBase) {
        try {
            loading.value = true
            let role: IRole = await roleSystem.update(id, roleData)
            return role
        } catch (err) {

            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if (err instanceof Error) {
                roleError.value = err.message
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteRole(id: string) {
        try {
            loading.value = true
            await roleSystem.delete(id)
        } catch (err) {
            console.log("composable delete error: ", err,)
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if (err instanceof Error) {
                roleError.value = err.message
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        fetchRole,
        fetchPermissions,
        paginateRole,
        createRole,
        editRole,
        deleteRole,
        loading,
        roleError,
        inputErrors
    }

}
