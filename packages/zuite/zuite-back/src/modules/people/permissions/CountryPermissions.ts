
enum CountryPermissions {

    Create = "country:create",
    Update = "country:update",
    Delete = "country:delete",
    View = "country:view",
    Manage = "country:manage",

    All = "country:all",

    ViewAll = "country:view:all",
    UpdateAll = "country:update:all",
    DeleteAll = "country:delete:all",

}

export { CountryPermissions };
export default CountryPermissions;

