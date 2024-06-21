enum IdentityPermissions {


    CreateUser = "user:create",
    UpdateUser = "user:update",
    DeleteUser = "user:delete",
    ViewUser = "user:view",
    ManageUser = "user:manage",

    CreateRole = "role:create",
    UpdateRole = "role:update",
    DeleteRole = "role:delete",
    ViewRole = "role:view",
    ManageRole = "role:manage",
    PermissionsRole = "role:permissions",

}

export default IdentityPermissions;
export {IdentityPermissions};
