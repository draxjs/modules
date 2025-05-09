import {IEntitySchema} from "../../../interfaces/IEntitySchema";
function getApiBasePath(entity: IEntitySchema) {
      if (entity.apiBasePath) {
            return '/api/'+ entity.apiBasePath;
      }else{
            return '/api/'+ entity.name.toLowerCase()
      }
}

export const TemplateRestProvider = (entity: IEntitySchema) => `
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {I${entity.name}, I${entity.name}Base} from '../interfaces/I${entity.name}'

class ${entity.name}Provider extends AbstractCrudRestProvider<I${entity.name}, I${entity.name}Base, I${entity.name}Base> {
    
  static singleton: ${entity.name}Provider
    
  constructor() {
   super('${getApiBasePath(entity)}')
  }
  
  static get instance() {
    if(!${entity.name}Provider.singleton){
      ${entity.name}Provider.singleton = new ${entity.name}Provider()
    }
    return ${entity.name}Provider.singleton
  }

}

export default ${entity.name}Provider

`
