import {IEntitySchema} from "../../../interfaces/IEntitySchema";

function hasTenantField(schema: any): boolean {
    return schema.hasOwnProperty("tenant");
}

export const TemplateFastifyController = (entity: IEntitySchema) => `
import ${entity.name}ServiceFactory from "../factory/services/${entity.name}ServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ${entity.name}Permissions from "../permissions/${entity.name}Permissions.js";
import type {I${entity.name}, I${entity.name}Base} from "../interfaces/I${entity.name}";

class ${entity.name}Controller extends AbstractFastifyController<I${entity.name}, I${entity.name}Base, I${entity.name}Base>   {

    constructor() {
        super(${entity.name}ServiceFactory.instance, ${entity.name}Permissions)
        this.tenantField = "${(getTenantField(entity.schema))}";
        this.userField = "${(getUserField(entity.schema))}";
        
        this.tenantFilter = ${(hasTenantField(entity.schema))};
        this.tenantSetter = ${(hasTenantField(entity.schema))};
        this.tenantAssert = ${(hasTenantField(entity.schema))};
        
        this.userFilter = ${(hasUserField(entity.schema))};
        this.userSetter = ${(hasUserField(entity.schema))};
        this.userAssert = ${(hasUserField(entity.schema))};
    }

}

export default ${entity.name}Controller;
export {
    ${entity.name}Controller
}

`

function hasUserField(schema: any): boolean {
    return schema.hasOwnProperty("user") || schema.hasOwnProperty("createdBy");
}

function getTenantField(schema: any): string {

    if(schema.tenantField){
        return schema.tenantField;
    }

    return "tenant"
}

function getUserField(schema: any): string {

    if(schema.userField){
        return schema.userField;
    }

    if(schema.hasOwnProperty("user")){
        return "user";
    }

    if(schema.hasOwnProperty("createdBy")){
        return "createdBy";
    }

    return "user"
}
