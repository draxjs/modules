import {inject, ref} from "vue";
import type {UserSystem} from "@drax/identity-front";
import type {IUser} from "@drax/identity-front";
import type {IInputError} from "@drax/common-front";
import {ClientError} from "@drax/common-front";


export function useUser() {

    const userSystem = inject('UserSystem') as UserSystem

    let userError = ref<string>('')
    let inputErrors = ref<IInputError[]>([])

    async function paginateUser(page = 1, perPage = 5) {
        return userSystem.paginateUser(page, perPage)
    }

    async function createUser(userData: IUser) {
        try {
            return await userSystem.create(userData)
        } catch (err) {
            console.log("composable createUser error: ", err, )
            if (err instanceof ClientError) {
                console.log("composable createUser ClientError: ", err.inputErrors)
                inputErrors.value = err.inputErrors
            }if(err instanceof Error) {
                console.log("composable createUser Error.message: ", err.message)
                userError.value = err.message
            }
        }

    }

    return {paginateUser, createUser, userError, inputErrors}
}
