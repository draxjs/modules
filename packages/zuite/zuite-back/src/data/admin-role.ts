import {PermissionService} from "@drax/identity-back"

const role = {
  name: "Admin",
  permissions: PermissionService.getPermissions(),
  childRoles: [],
  readonly: true
}

export default role
