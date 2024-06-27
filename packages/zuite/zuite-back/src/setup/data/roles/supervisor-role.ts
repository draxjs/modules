import {IdentityPermissions} from "@drax/identity-back"
import vendedorRole from "./vendedor-role.js";

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
    vendedorRole.name
  ],
  readonly: true
}

export default role
