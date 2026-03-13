import FilePermissions from "../../../src/permissions/FilePermissions";

const restrictedRoleData = {
    name: "FileRole",
    permissions: [
        FilePermissions.View,
        FilePermissions.Create,
        FilePermissions.Update,
        FilePermissions.Delete,
    ],
    childRoles: [],
    readonly: true
}

export default restrictedRoleData
export {restrictedRoleData}
