import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";

const generateEntityBaseSchema = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){

        switch (schema[field].type) {
            case "string":
            case "password":
            case "file":
            case "longString":
                fields.push(`    ${field}: z.string()${schema[field].required? ".min(1,'validation.required')" : ".optional()"}${schema[field].default? ".default('"+schema[field].default+"')" : ""}`)
                break;
            case "enum":
                if(!schema[field].enum){
                    throw new Error("enum fields must have a enum")
                }
                fields.push(`    ${field}: z.enum(['${schema[field].enum.join("', '")}'])${schema[field].required? "" : ".optional()"}${schema[field].default? ".default('"+schema[field].default+"')" : ""}`)
                break;
            case "number":
                fields.push(`    ${field}: z.number()${schema[field].required? ".min(0,'validation.required')" : ".nullable().optional()"}${schema[field].default? ".default("+schema[field].default+")" : ""}`)
                break;
            case "boolean":
                fields.push(`    ${field}: z.boolean()${schema[field].required? "" : ".optional()"}`)
                break;
            case "date":
                fields.push(`    ${field}: ${schema[field].required ? 'z.coerce.date({message: "validation.required"})' : 'z.coerce.date().nullable().optional()'}`)
                break;
            case "ref":
                fields.push(`    ${field}: z.string()${schema[field].required ? ".min(1,'validation.required')" : ".optional().nullable()"}`)
                break;
            case "fullFile":
                fields.push(`    ${field}: z.object({
                filename: z.string().min(1,'validation.required'),
                filepath: z.string().min(1,'validation.required'),
                size: z.number().min(1,'validation.required'),
                mimetype: z.string().optional(),
                url: z.string().min(1,'validation.required')
                })${schema[field].required ? "" : ".optional()"}`)
                break;
            case "object":
                if(!schema[field].schema){
                    throw new Error("object fields must have a schema")
                }
                fields.push(`    ${field}: z.object({${generateEntityBaseSchema(schema[field].schema)}})`)
                break;
            case "array.string":
                fields.push(`    ${field}: z.array(z.string())${schema[field].required ? "" : ".optional()"}${schema[field].default? ".default("+JSON.stringify(schema[field].default)+")" : ""}`)
                break;
            case "array.enum":
                if(!schema[field].enum){
                    throw new Error("enum fields must have a enum")
                }
                fields.push(`    ${field}: z.array(z.enum(['${schema[field].enum.join("', '")}']))${schema[field].required ? "" : ".optional()"}${schema[field].default? ".default("+JSON.stringify(schema[field].default)+")" : ""}`)
                break;
            case "array.number":
                fields.push(`    ${field}: z.array(z.number())${schema[field].required ? "" : ".optional()"}${schema[field].default? ".default("+JSON.stringify(schema[field].default)+")" : ""}`)
                break;
            case "array.ref":
                fields.push(`    ${field}: z.array(z.string())${schema[field].required ? "" : ".optional()"}`)
                break;
            case "array.fullFile":
                fields.push(`    ${field}: z.array(z.object({
                filename: z.string().min(1,'validation.required'),
                filepath: z.string().min(1,'validation.required'),
                size: z.number().min(1,'validation.required'),
                mimetype: z.string().optional(),
                url: z.string().min(1,'validation.required')
                }))${schema[field].required ? "" : ".optional()"}`)
                break;
            case "array.object":
                if(!schema[field].schema){
                    throw new Error("array.object fields must have a schema")
                }
                fields.push(`    ${field}: z.array(
z.object({${generateEntityBaseSchema(schema[field].schema)}})
    )${schema[field].required ? "" : ".optional()"}`)
                break;
            default:
                throw new Error("Unsupported type " + schema[field].type)
        }
    }
    content += fields.join(",\n")
    return content;
}

const generateEntitySchema = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){

        switch (schema[field].type) {

            case "ref":
                fields.push(`${field}: z.object({_id: z.string(), ${schema[field].refDisplay}: z.string()})${schema[field].required ? "" : ".nullable().optional()"}`)
                break;

            case "array.ref":
                fields.push(`${field}: z.array(z.object({_id: z.string(), ${schema[field].refDisplay}: z.string()}))${schema[field].required ? "" : ".optional()"}`)
                break;
            default:
                break;
        }
    }
    content += fields.join(",\n")
    return content;
}

const generateRefImportsSchema = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){
        if(schema[field].type === 'ref' && schema[field].ref === 'User'){
            fields.push(`import {UserSchema} from '@drax/identity-back';`)
        }else if(schema[field].type === 'ref' && schema[field].ref === 'Tenant'){
            fields.push(`import {TenantSchema} from '@drax/identity-back';`)
        }else if(schema[field].type === 'ref' || schema[field].type === 'array.ref' ){
            fields.push(`import ${schema[field].ref}Schema from './${schema[field].ref}Schema.js';`)
        }
    }
    content += fields.join("\n")
    return content;
}


export const TemplateSchema = (entity: IEntitySchema) => `
import { z } from 'zod';


const ${entity.name}BaseSchema = z.object({
  ${generateEntityBaseSchema(entity.schema)}
});

const ${entity.name}Schema = ${entity.name}BaseSchema
    .extend({
      _id: z.string(),
       ${generateEntitySchema(entity.schema)}
    })

export default ${entity.name}Schema;
export {${entity.name}Schema, ${entity.name}BaseSchema}
`
