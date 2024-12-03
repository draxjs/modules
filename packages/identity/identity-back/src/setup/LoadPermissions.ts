import {PermissionService} from "../services/PermissionService.js";

function LoadPermissions(permissions: string[]) {
    for(const permission of permissions){
        PermissionService.addPermission(permission)
    }
}

export default LoadPermissions
export {
    LoadPermissions
}
