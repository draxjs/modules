// Definición de Enum para los permisos del módulo Identity
enum IdentityPermissions {
    CreateUser = "user:create",
    EditUser = "user:edit",
    DeleteUser = "user:delete",
    ViewUser = "user:view",

    CreateRole = "role:create",
    EditRole = "role:edit",
    DeleteRole = "role:delete",
    ViewRole = "role:view",

}

export default IdentityPermissions;
export {IdentityPermissions};
