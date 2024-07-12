import {LoadPermissions} from "@drax/identity-back";
import {IdentityPermissions} from "@drax/identity-back";
import {MediaPermissions} from "@drax/media-back";


function InitializePermissions() {

    //Load Identity Permissions
    const identityPermissions = Object.values(IdentityPermissions)
    const mediaPermissions = Object.values(MediaPermissions)

    //Merge All Permissions
    const permissions = [
        ...identityPermissions,
        ...mediaPermissions
    ]

    //Load All Permissions
    LoadPermissions(permissions)
}

export default InitializePermissions

export {InitializePermissions}

