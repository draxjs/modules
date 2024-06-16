import {inject} from "vue";
import type UserSystem from "@/core/system/UserSystem";


export function useUserCrud() {

    const userSystem = inject('UserSystem') as UserSystem

    function paginateUser(page = 1, perPage = 5){
        return userSystem.paginateUser(page, perPage)
    }

    return {paginateUser}
}
