import {IEntitySchema, IFieldSchema, ISchema} from "../../../interfaces/IEntitySchema";

const generateRefs = (schema: ISchema) => {
    let content: string = ""
    let refs: Array<string> = []

    for (const field in schema) {
        if (['ref', 'array.ref'].includes(schema[field].type) && schema[field].ref) {
            refs.push(`${schema[field].ref}: ${schema[field].ref}Crud.instance `)
        }
    }
    content += refs.join(",\n")
    return content;
}

const generateImportRefs = (schema: ISchema) => {
    let content: string = ""
    let refs: Array<string> = []

    for (const field in schema) {
        if (['ref', 'array.ref'].includes(schema[field].type) && schema[field].ref) {

            if (['Tenant', 'User', 'Role'].includes(schema[field].ref as string)) {
                refs.push(`import {${schema[field].ref}Crud} from "@drax/identity-vue"`)
            } else {
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


    for (const field in schema) {
        if (schema[field].required) {
            fields.push(`${field}: [(v: any) => !!v || 'validation.required']`)
        } else if(['object','array.object'].includes(schema[field].type)) {
            fields.push(`${field}: []`)
        }
        //TODO add object rules support
        // if(schema[field].type === 'object' && schema[field].schema){
        //     for (const sfield in schema[field].schema) {
        //         fields.push(`${field}_${sfield}: []`)
        //     }
        // }
    }
    content += fields.join(",\n")
    return content;
}

const generateHeaders = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for (const field in schema) {
        if (schema[field].header) {
            fields.push(`{title: '${field}',key:'${field}', align: 'start'}`)
        }
    }
    content += fields.join(",\n")
    return content;
}

const generateDefault = (field: string, fieldSchema: IFieldSchema) => {
        switch (fieldSchema.type) {
            case "string":
            case "longString":
            case "password":
            case "file":
                return fieldSchema.default != undefined ? `'${fieldSchema.default}'` : `''`
            case "fullFile":
                return `{}`
            case "number":
                return fieldSchema.default != undefined ? fieldSchema.default : null
            case "boolean":
                return fieldSchema.default != undefined ? fieldSchema.default : false
            case "ref":
            case "date":
            case "enum":
                return fieldSchema.default != undefined ? `'${fieldSchema.default}'` : null
            case "array.string":
            case "array.number":
            case "array.file":
            case "array.ref":
            case "array.object":
            case "array.enum":
                return Array.isArray(fieldSchema.default) ? `${JSON.stringify(fieldSchema.default)}` : `[]`
            case "object":
                return generateObjectDefault(fieldSchema.schema)
            default:
                    return null
        }
}

const generateObjectDefault = (schema: ISchema | undefined) => {
    let objDefault: any = {}
    for (const field in schema) {
        objDefault[field] = generateDefault(field, schema[field])
    }
    return JSON.stringify(objDefault)
}

const generateFields = (schema: ISchema | undefined) => {
    let content: string = ""
    let fields: Array<string> = []

    if (schema === undefined) {
        throw new Error("generateFields: schema is undefined")
    }

    for (const field in schema) {

        const compositionField = [
            `name:'${field}'`,
            `type:'${schema[field].type}'`,
            `label:'${field}'`,
            `default:${generateDefault(field, schema[field])}`,
        ]

        if(schema[field].groupMenu){
            compositionField.push(`groupMenu: '${schema[field].groupMenu}'`)
        }

        if(schema[field].groupTab){
            compositionField.push(`groupTab: '${schema[field].groupTab}'`)
        }

        if(schema[field].hint){
            compositionField.push(`hint: '${schema[field].hint}'`)
        }


        if (schema[field].persistentHint !== undefined) {
            compositionField.push(`persistentHint: ${schema[field].persistentHint}`)
        }

        if (schema[field].placeholder) {
            compositionField.push(`placeholder: '${schema[field].placeholder}'`)
        }

        if (schema[field].persistentPlaceholder !== undefined) {
            compositionField.push(`persistentPlaceholder: ${schema[field].persistentPlaceholder}`)
        }

        if (schema[field].prependIcon) {
            compositionField.push(`prependIcon: '${schema[field].prependIcon}'`)
        }

        if (schema[field].prependInnerIcon) {
            compositionField.push(`prependInnerIcon: '${schema[field].prependInnerIcon}'`)
        }

        if (schema[field].appendIcon) {
            compositionField.push(`appendIcon: '${schema[field].appendIcon}'`)
        }

        if (schema[field].appendInnerIcon) {
            compositionField.push(`appendInnerIcon: '${schema[field].appendInnerIcon}'`)
        }

        if (schema[field].permission) {
            compositionField.push(`permission: '${schema[field].permission}'`)
        }

        if (schema[field].readonly !== undefined) {
            compositionField.push(`readonly: ${schema[field].readonly}`)
        }

        if (schema[field].hideDetails !== undefined) {
            compositionField.push(`hideDetails: ${schema[field].hideDetails}`)
        }

        switch (schema[field].type) {
            case "ref":
            case "array.ref":
                compositionField.push(`ref: '${schema[field].ref}'`)
                compositionField.push(`refDisplay: '${schema[field].refDisplay}'`)
                break;
            case "enum":
            case "array.enum":
                compositionField.push(`enum: ['${schema[field].enum?.join("', '")}']`)
                break;
            case "object":
            case "array.object":
                if (!schema[field].schema) {
                    throw new Error("object fields must have a schema")
                }
                compositionField.push(`objectFields: [${generateFields(schema[field].schema)}]`)
                break;

        }

        fields.push(`{${compositionField.join(',')}}`)

    }
    content += fields.join(",\n")
    return content;
}

const generateTabs = (entity: IEntitySchema) => {
    if(!entity?.tabs) return ""
    return entity?.tabs?.map(tab => `'${tab}'`).join(", ")
}

const generateMenus = (entity: IEntitySchema) => {
    if(!entity?.menus) return ""
    return entity?.menus?.map(menu => `'${menu}'`).join(", ")
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
  
  get selectedHeaders(): string[] {
    return this.headers.map(header => header.key)
  }
  
  get actionHeaders():IEntityCrudHeader[]{
    return [
      {
        title: 'action.actions',
        key: 'actions',
        sortable: false,
        align: 'center',
        minWidth: '190px',
        fixed: 'end'
      },
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
  
  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get importFormats(){
    return ['CSV', 'JSON']
  }

  get dialogFullscreen(){
    return false
  }
  
  get tabs() {
    return [
     ${generateTabs(entity)}
    ]
  }
  
  get menus() {
    return [
     ${generateMenus(entity)}
    ]
  }


}

export default ${entity.name}Crud

`
