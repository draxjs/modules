import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplatePermissions = (entity: IEntitySchema) => `
enum ${entity.name}Permissions {

    Create = "${entity.name.toLowerCase()}:create",
    Update = "${entity.name.toLowerCase()}:update",
    Delete = "${entity.name.toLowerCase()}:delete",
    View = "${entity.name.toLowerCase()}:view",
    Manage = "${entity.name.toLowerCase()}:manage"

}

export { ${entity.name}Permissions };
export default ${entity.name}Permissions;

`
