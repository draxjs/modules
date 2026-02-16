import {PermissionService} from "@drax/identity-back"

const adminRoleData = {
  name: "Admin",
  permissions: PermissionService.getPermissions(),
  childRoles: [],
  readonly: true
}

export default adminRoleData
export {
  adminRoleData
}
