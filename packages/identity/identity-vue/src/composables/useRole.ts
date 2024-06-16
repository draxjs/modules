import {inject} from "vue";
import type {RoleSystem} from "@drax/identity-front";


export function useRole() {

    const roleSystem = inject('RoleSystem') as RoleSystem

    function fetchRole(){
        return roleSystem.fetchRole()
    }

    return {fetchRole}

}
