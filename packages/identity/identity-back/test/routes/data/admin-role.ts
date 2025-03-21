import {PermissionService} from "../../../src/services/PermissionService.js"

const role = {
  name: "Admin",
  permissions: PermissionService.getPermissions(),
  childRoles: [],
  readonly: true
}

export default role
