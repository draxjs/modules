import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";

const generateRefs = (schema: ISchema) => {
 let content: string = ""
    let refs: Array<string> = []

    for(const field in schema){
        if(['ref','array.ref'].includes(schema[field].type) && schema[field].ref){
            refs.push(`${schema[field].ref}: ${schema[field].ref}Crud.instance `)
        }
    }
    content += refs.join(",\n")
    return content;
}

const generateImportRefs = (schema: ISchema) => {
    let content: string = ""
    let refs: Array<string> = []

    for(const field in schema){
        if(['ref','array.ref'].includes(schema[field].type) && schema[field].ref){

            if(['Tenant','User','Role'].includes(schema[field].ref as string)){
                refs.push(`import {${schema[field].ref}Crud} from "@drax/identity-vue"`)
            }else{
                refs.push(`import ${schema[field].ref}Crud from "./${schema[field].ref}Crud";`)
            }


        }
    }
    content += refs.join("\n")
    return content;
}

const generateRules = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){
        if(schema[field].required){
            fields.push(`${field}: [(v: any) => !!v || 'validation.required']`)
        }else{
            fields.push(`${field}: []`)
        }
    }
    content += fields.join(",\n")
    return content;
}

const generateHeaders = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){
        if(schema[field].header){
            fields.push(`{title: '${field}',key:'${field}', align: 'start'}`)
        }
    }
    content += fields.join(",\n")
    return content;
}

const generateFields = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){
        switch (schema[field].type) {
            case "string":
                fields.push(`{name: '${field}', type: 'string', label: '${field}', default:'' }`)
                break;
            case "number":
                fields.push(`{name: '${field}', type: 'number', label: '${field}', default: 0 }`)
                break;
            case "boolean":
                fields.push(`{name: '${field}', type: 'boolean', label: '${field}', default:false }`)
                break;
            case "date":
                fields.push(`{name: '${field}', type: 'date', label: '${field}', default:null }`)
                break;
            case "ref":
                fields.push(`{name: '${field}', type: 'ref', ref: '${schema[field].ref}', refDisplay: '${schema[field].refDisplay}',label: '${field}', default:null }`)
                break;
            case "object":
                if(!schema[field].schema){
                    throw new Error("object fields must have a schema")
                }
                fields.push(`{name: '${field}', type: 'object', label: '${field}', default:{}, objectFields: [${generateFields(schema[field].schema)}] }`)
                break;
            case "array.string":
                fields.push(`{name: '${field}', type: 'array.string', label: '${field}', default:[] }`)
                break;
            case "array.number":
                fields.push(`{name: '${field}', type: 'array.number', label: '${field}', default:[] }`)
                break;
            case "array.ref":
                fields.push(`{name: '${field}', type: 'array.ref', ref: '${schema[field].ref}', label: '${field}', default:[] }`)
                break;
            case "array.object":
                if(!schema[field].schema){
                    throw new Error("array.object fields must have a schema")
                }
                fields.push(`{name: '${field}', type: 'array.object', label: '${field}', default:[], objectFields: [${generateFields(schema[field].schema)}] }`)
                break;
            default:
                throw new Error("Unsupported type " + schema[field].type)
        }
    }
    content += fields.join(",\n")
    return content;
}


export const TemplateEntityCrud = (entity: IEntitySchema) => `
import {EntityCrud} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader, 
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import ${entity.name}Provider from "../providers/${entity.name}Provider";

//Import EntityCrud Refs
${generateImportRefs(entity.schema)}

class ${entity.name}Crud extends EntityCrud implements IEntityCrud {

  static singleton: ${entity.name}Crud

  constructor() {
    super();
    this.name = '${entity.name}'
  }
  
  static get instance(): ${entity.name}Crud {
    if(!${entity.name}Crud.singleton){
      ${entity.name}Crud.singleton = new ${entity.name}Crud()
    }
    return ${entity.name}Crud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: '${entity.name.toLowerCase()}:manage', 
      view: '${entity.name.toLowerCase()}:view', 
      create: '${entity.name.toLowerCase()}:create', 
      update: '${entity.name.toLowerCase()}:update', 
      delete: '${entity.name.toLowerCase()}:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        ${generateHeaders(entity.schema)}
    ]
  }

  get provider(): IDraxCrudProvider<any, any, any>{
    return ${entity.name}Provider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      ${generateRefs(entity.schema)}
    }
  }

  get rules():IEntityCrudRules{
    return {
      ${generateRules(entity.schema)}
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        ${generateFields(entity.schema)}
    ]
  }
  
  get filters():IEntityCrudFilter[]{
    return [
      //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
    ]
  }
  
  get isViewable(){
    return true
  }

  get isEditable(){
    return true
  }

  get isCreatable(){
    return true
  }

  get isDeletable(){
    return true
  }

  get isExportable(){
    return true
  }

  get exportFormats(){
    return ['CSV', 'JSON']
  }

  get exportHeaders(){
    return ['_id']
  }

  get isImportable(){
    return true
  }

  get importFormats(){
    return ['CSV', 'JSON']
  }

  get dialogFullscreen(){
    return false
  }

}

export default ${entity.name}Crud

`
