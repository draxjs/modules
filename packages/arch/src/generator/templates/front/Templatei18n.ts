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
  
    ${entity.name}: {
          entity: '${entity.name}',
          menu: '${entity.name}',
          crud: 'Manage ${entity.name}',
          fields:{
${generateT(entity.schema)}
          }
      }
  },
  es: {
     ${entity.name}: {
          entity: '${entity.name}',
          menu: '${entity.name}',
          crud: 'Gestionar ${entity.name}',
          fields:{
${generateT(entity.schema)}
          }
      }
  }
}

export default messages;  
`
