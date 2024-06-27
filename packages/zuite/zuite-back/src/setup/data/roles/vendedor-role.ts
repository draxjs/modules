import {IdentityPermissions} from "@drax/identity-back"

const role = {
  name: "Vendedor",
  permissions: [
    IdentityPermissions.ViewUser,
  ],
  childRoles: [
  ],
  readonly: true
}

export default role
