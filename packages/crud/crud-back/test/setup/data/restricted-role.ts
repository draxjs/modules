import PersonPermissions from "../../people/permissions/PersonPermissions";

const restrictedRoleData = {
    name: "Restricted",
    permissions: [
        PersonPermissions.Create,
        PersonPermissions.Update,
        PersonPermissions.Delete,
        PersonPermissions.View
    ],
    childRoles: [],
    readonly: true
}

export default restrictedRoleData
export {restrictedRoleData}
