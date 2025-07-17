
enum EntityPermissions {

    Create = "entity:create",
    Update = "entity:update",
    Delete = "entity:delete",
    View = "entity:view",
    Manage = "entity:manage",

    //Opcion 1: Si el rol del usuario tiene entity:own se aplican filtros y asserts de usuarios (ver/editar/eliminar)
    Own = "entity:own",

    //Opcion 2: Si el rol del usuario tiene entity:all se omiten los filtros y asserts de usuarios (ver/editar/eliminar)
    All = "entity:all",

    //Opcion 3: Aplicar la estrategia de all de forma granular en ver/editar/eliminar
    UpdateAll = "entity:update:all",
    DeleteAll = "entity:delete:all",
    VieAll = "entity:view:all",

}

export { EntityPermissions };
export default EntityPermissions;

