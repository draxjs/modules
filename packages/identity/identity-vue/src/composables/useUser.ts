import {ref} from "vue";
import type {UserSystem} from "@drax/identity-front";
import  {UserSystemFactory} from "@drax/identity-front";
import type {IClientInputError} from "@drax/common-front";
import {ClientError} from "@drax/common-front";
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IDraxPaginateOptions} from "@drax/crud-share";


export function useUser() {

    const userSystem: UserSystem = UserSystemFactory.getInstance()

    let userError = ref<string>('')
    let inputErrors = ref<IClientInputError>()
    let loading = ref(false);

    async function paginateUser({page= 1, limit= 5, orderBy="", order = "asc", search = ""}:IDraxPaginateOptions) {
        loading.value = true
        let paginatedUser = userSystem.paginate({page, limit, orderBy, order, search})
        loading.value = false
        return paginatedUser
    }

    async function createUser(userData: IUserCreate) {
        try {
            loading.value = true
            let user: IUser =  await userSystem.create(userData)
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
            let user: IUser = await userSystem.update(id, userData)
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
            await userSystem.delete(id)
        } catch (err) {
            console.log("composable delete error: ", err, )
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
