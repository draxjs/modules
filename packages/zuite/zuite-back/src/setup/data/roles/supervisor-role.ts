import {UserPermissions, TenantPermissions, RolePermissions} from "@drax/identity-back"
import operatorRole from "./operator-role.js";

const role = {
    name: "Supervisor",
    icon: 'mdi-account-supervisor-circle',
    color: 'purple',
    permissions: [
        UserPermissions.Create,
        UserPermissions.View,
        UserPermissions.Manage,
        UserPermissions.Update,
        RolePermissions.View,
    ],
    childRoles: [
        operatorRole.name
    ],
    readonly: true
}

export default role
