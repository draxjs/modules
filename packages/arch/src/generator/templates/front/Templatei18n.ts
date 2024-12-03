import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";

const generateT = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for (const field in schema) {
        fields.push(`           ${field}:'${field}'`)
        if(schema[field].type === "object" || schema[field].type === "array.object"){
            for (const sfield in schema[field].schema) {
                fields.push(`           ${sfield}: '${sfield}'`)
            }
        }
    }
    content += fields.join(",\n")
    return content;
}


export const Templatei18n = (entity: IEntitySchema) => `
const messages = {
  en: {
  
    ${entity.name.toLowerCase()}: {
          entity: '${entity.name}',
          menu: '${entity.name}',
          crud: 'Manage ${entity.name}',
          field:{
            ${generateT(entity.schema)}
          }
      },
      permission: {
              '${entity.name.toLowerCase()}:view': 'View ${entity.name}',
              '${entity.name.toLowerCase()}:create': 'Create ${entity.name}',
              '${entity.name.toLowerCase()}:update': 'Edit ${entity.name}',
              '${entity.name.toLowerCase()}:delete': 'Delete ${entity.name}',
              '${entity.name.toLowerCase()}:manage': 'Manage ${entity.name}',
      }
  },
  es: {
     ${entity.name.toLowerCase()}: {
          entity: '${entity.name}',
          menu: '${entity.name}',
          crud: 'Gestionar ${entity.name}',
          field:{
            ${generateT(entity.schema)}
          }
      },
     permission: {
              '${entity.name.toLowerCase()}:view': 'Ver ${entity.name}',
              '${entity.name.toLowerCase()}:create': 'Crear ${entity.name}',
              '${entity.name.toLowerCase()}:update': 'Editar ${entity.name}',
              '${entity.name.toLowerCase()}:delete': 'Eliminar ${entity.name}',
              '${entity.name.toLowerCase()}:manage': 'Gestionar ${entity.name}',
     }
  }
}

export default messages;  
`
