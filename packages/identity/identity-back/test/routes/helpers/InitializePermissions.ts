import {LoadPermissions,
    UserPermissions, RolePermissions, TenantPermissions, UserApiKeyPermissions
} from "../../../src/index.js";


function InitializePermissions() {

    //Merge All Permissions
    const permissions = [
        ...Object.values(UserPermissions),
        ...Object.values(RolePermissions),
        ...Object.values(TenantPermissions),
        ...Object.values(UserApiKeyPermissions),
    ]

    //Load All Permissions
    LoadPermissions(permissions)
}

export default InitializePermissions

export {InitializePermissions}

