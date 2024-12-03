import {IEntitySchema} from "../../../interfaces/IEntitySchema";

function hasTenantField(schema: any): boolean {
    return schema.hasOwnProperty("tenant");
}

function hasUserField(schema: any): boolean {
    return schema.hasOwnProperty("user");
}

export const TemplateFastifyController = (entity: IEntitySchema) => `
import ${entity.name}ServiceFactory from "../factory/services/${entity.name}ServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ${entity.name}Permissions from "../permissions/${entity.name}Permissions.js";
import type {I${entity.name}, I${entity.name}Base} from "../interfaces/I${entity.name}";

class ${entity.name}Controller extends AbstractFastifyController<I${entity.name}, I${entity.name}Base, I${entity.name}Base>   {

    constructor() {
        super(${entity.name}ServiceFactory.instance, ${entity.name}Permissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = ${(hasTenantField(entity.schema))};
        this.userFilter = ${(hasUserField(entity.schema))};
        this.tenantSetter = ${(hasTenantField(entity.schema))};
        this.userSetter = ${(hasUserField(entity.schema))};
        this.tenantAssert = ${(hasTenantField(entity.schema))};
        this.userAssert = ${(hasUserField(entity.schema))};
    }

}

export default ${entity.name}Controller;
export {
    ${entity.name}Controller
}

`
