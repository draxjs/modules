import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";



export const TemplateEntityRepositoryInterface = (entity: IEntitySchema) => `
import type {I${entity.name}, I${entity.name}Base} from './I${entity.name}'
import {ICrudRepository} from "@drax/crud-back";

interface I${entity.name}Repository extends ICrudRepository<I${entity.name}, I${entity.name}Base, I${entity.name}Base>{

}

export {I${entity.name}Repository}


`
