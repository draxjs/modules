import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";



export const TemplateEntityRepositoryInterface = (entity: IEntitySchema) => `
import type {I${entity.name}, I${entity.name}Base} from './I${entity.name}'
import {IDraxCrudRepository} from "@drax/crud-share";

interface I${entity.name}Repository extends IDraxCrudRepository<I${entity.name}, I${entity.name}Base, I${entity.name}Base>{

}

export {I${entity.name}Repository}


`
