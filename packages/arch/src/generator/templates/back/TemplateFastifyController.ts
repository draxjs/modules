import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplateFastifyController = (entity: IEntitySchema) => `
import ${entity.name}ServiceFactory from "../factory/${entity.name}ServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ${entity.name}Permissions from "../permissions/${entity.name}Permissions.js";
import type {I${entity.name}, I${entity.name}Base} from "../interfaces/I${entity.name}";

class ${entity.name}Controller extends AbstractFastifyController<I${entity.name}, I${entity.name}Base, I${entity.name}Base>   {

    constructor() {
        super(${entity.name}ServiceFactory.instance, ${entity.name}Permissions)
    }

}

export default ${entity.name}Controller;
export {
    ${entity.name}Controller
}

`
