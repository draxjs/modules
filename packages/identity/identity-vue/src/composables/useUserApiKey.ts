import {inject, ref} from "vue";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type { UserApiKeySystem} from "@drax/identity-front";
import {ClientError} from "@drax/common-front";
import type { IClientInputError} from "@drax/common-front";


export function useUserApiKey() {

    const userApiKeySystem = inject('UserApiKeySystem') as UserApiKeySystem

    let userApiKeyError = ref<string>('')
    let inputErrors = ref<IClientInputError>()
    let loading = ref(false);


    async function paginateUserApiKey({page= 1, limit= 5, orderBy="", orderDesc=false, search = ""}) {
        loading.value = true
        let paginateduserApiKey = userApiKeySystem.paginate({page, limit, orderBy, orderDesc, search})
        loading.value = false
        return paginateduserApiKey
    }

    async function createUserApiKey(userApiKeyData: IUserApiKeyBase) {
        try {
            loading.value = true
            let userApiKey: IUserApiKey =  await userApiKeySystem.create(userApiKeyData)
            return userApiKey
        } catch (err) {
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }if(err instanceof Error) {
                userApiKeyError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }

    }

    async function editUserApiKey(id: string, userApiKeyData: IUserApiKeyBase) {
        try {
            loading.value = true
            let userApiKey: IUserApiKey = await userApiKeySystem.update(id, userApiKeyData)
            return userApiKey
        } catch (err) {

            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                userApiKeyError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    async function deleteUserApiKey(id: string) {
        try {
            loading.value = true
            await userApiKeySystem.delete(id)
        } catch (err) {
            console.log("composable delete error: ", err, )
            if (err instanceof ClientError) {
                inputErrors.value = err.inputErrors
            }
            if(err instanceof Error) {
                userApiKeyError.value = err.message
            }
            throw err
        }finally {
            loading.value = false
        }
    }

    return {paginateUserApiKey, createUserApiKey, editUserApiKey, deleteUserApiKey, loading, userApiKeyError, inputErrors}

}