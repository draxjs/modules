import {inject} from "vue";
import type {UserSystem} from "@drax/identity-front";


export function useUser() {

    const userSystem = inject('UserSystem') as UserSystem

    function paginateUser(page = 1, perPage = 5){
        return userSystem.paginateUser(page, perPage)
    }

    return {paginateUser}
}
