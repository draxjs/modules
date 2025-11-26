import {PermissionService} from "@drax/identity-back"

const role = {
  name: "Admin",
  permissions: PermissionService.getPermissions(),
  childRoles: [],
  readonly: true,
  icon: 'mdi-chess-king',
  color: 'indigo'
}

export default role
