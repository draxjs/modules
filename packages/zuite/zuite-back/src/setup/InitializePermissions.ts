import {LoadPermissions} from "@drax/identity-back";
import {IdentityPermissions} from "@drax/identity-back";


function InitializePermissions(){

   //Load Identity Permissions
   const identityPermissions = Object.values(IdentityPermissions)

   //Merge All Permissions
   const permissions = [
      ...identityPermissions
   ]

   //Load All Permissions
   LoadPermissions(permissions)
}

export default InitializePermissions

export {InitializePermissions}

