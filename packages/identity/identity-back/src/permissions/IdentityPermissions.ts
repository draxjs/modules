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


    CreateTenant = "tenant:create",
    UpdateTenant = "tenant:update",
    DeleteTenant = "tenant:delete",
    ViewTenant = "tenant:view",
    ManageTenant = "tenant:manage",

}

export default IdentityPermissions;
export {IdentityPermissions};
