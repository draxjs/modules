import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplateService = (entity: IEntitySchema) => `
import type{I${entity.name}Repository} from "../interfaces/I${entity.name}Repository";
import type {I${entity.name}Base, I${entity.name}} from "../interfaces/I${entity.name}";
import {AbstractService} from "@drax/crud-back";
import {ZodSchema} from "zod";

class ${entity.name}Service extends AbstractService<I${entity.name}, I${entity.name}Base, I${entity.name}Base> {

    _repository: I${entity.name}Repository

    constructor(${entity.name}Repository: I${entity.name}Repository, schema?: ZodSchema) {
        super(${entity.name}Repository, schema);
    }

}

export default ${entity.name}Service
export {${entity.name}Service}
`

