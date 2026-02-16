import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplateService = (entity: IEntitySchema) => `
import type{I${entity.name}Repository} from "../interfaces/I${entity.name}Repository";
import type {I${entity.name}Base, I${entity.name}} from "../interfaces/I${entity.name}";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ${entity.name}Service extends AbstractService<I${entity.name}, I${entity.name}Base, I${entity.name}Base> {


    constructor(${entity.name}Repository: I${entity.name}Repository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(${entity.name}Repository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default ${entity.name}Service
export {${entity.name}Service}
`

