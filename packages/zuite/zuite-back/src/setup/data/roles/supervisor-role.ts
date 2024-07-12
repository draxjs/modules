import {IdentityPermissions} from "@drax/identity-back"
import operatorRole from "./operator-role.js";

const role = {
  name: "Supervisor",
  permissions: [
    IdentityPermissions.CreateUser,
    IdentityPermissions.ViewUser,
    IdentityPermissions.ManageUser,
    IdentityPermissions.UpdateUser,
    IdentityPermissions.ViewRole,
    IdentityPermissions.ViewTenant,

  ],
  childRoles: [
    operatorRole.name
  ],
  readonly: true
}

export default role
