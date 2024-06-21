import {inject, ref} from "vue";
import type {IUserPassword, UserSystem} from "@drax/identity-front";
import type {IUser} from "@drax/identity-front";
import type {IClientInputError} from "@drax/common-front";
import {ClientError} from "@drax/common-front";
import type {IUserCreate, IUserUpdate} from "@drax/identity-front";


export function useUser() {

    const userSystem = inject('UserSystem') as UserSystem

    let userError = ref<string>('')
    let inputErrors = ref<IClientInputError>()
    let loading = ref(false);

    async function paginateUser(page = 1, perPage = 5, search = "") {
        loading.value = true
        let paginatedUser = userSystem.paginateUser(page, perPage, search)
        loading.value = false
        return paginatedUser
    }

    async function createUser(userData: IUserCreate) {
        try {
            loading.value = true
            let user: IUser =  await userSystem.createUser(userData)
            return user
        } catch (err) {
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }if(err instanceof Error) {
                userError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }

    }

    async function changeUserPassword(id: string, newPassword: string){
        try {
            loading.value = true
            return await userSystem.changeUserPassword(id, newPassword)
        } catch (err) {
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                userError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    async function editUser(id: string, userData: IUserUpdate) {
        try {
            loading.value = true
            let user: IUser = await userSystem.editUser(id, userData)
            return user
        } catch (err) {
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                userError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    async function deleteUser(id: string) {
        try {
            loading.value = true
            await userSystem.deleteUser(id)
        } catch (err) {
            console.log("composable deleteUser error: ", err, )
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                userError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    return {paginateUser, createUser, editUser, changeUserPassword, deleteUser, loading, userError, inputErrors}
}
