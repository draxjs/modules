import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";

const generateEntitySchema = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){
        switch (schema[field].type) {
            case "string":
                fields.push(`    ${field}: z.string()${schema[field].required? ".min(1,'validation.required')" : ""}`)
                break;
            case "enum":
                if(!schema[field].enum){
                    throw new Error("enum fields must have a enum")
                }
                fields.push(`    ${field}: z.enum(['${schema[field].enum.join("', '")}'])`)
                break;
            case "number":
                fields.push(`    ${field}: z.number()${schema[field].required? ".min(0,'validation.required')" : ""}`)
                break;
            case "boolean":
                fields.push(`    ${field}: z.boolean()`)
                break;
            case "date":
                fields.push(`    ${field}: ${schema[field].required ? 'z.coerce.date({message: "validation.required"})' : 'z.coerce.date().nullable()'}`)
                break;
            case "ref":
                fields.push(`    ${field}: z.string()${schema[field].required ? ".min(1,'validation.required')" : ".nullable()"}`)
                break;
            case "object":
                if(!schema[field].schema){
                    throw new Error("object fields must have a schema")
                }
                fields.push(`    ${field}: z.object({${generateEntitySchema(schema[field].schema)}})`)
                break;
            case "array.string":
                fields.push(`    ${field}: z.array(z.string())`)
                break;
            case "array.enum":
                if(!schema[field].enum){
                    throw new Error("enum fields must have a enum")
                }
                fields.push(`    ${field}: z.array(z.enum(['${schema[field].enum.join("', '")}']))`)
                break;
            case "array.number":
                fields.push(`    ${field}: z.array(z.number())`)
                break;
            case "array.ref":
                fields.push(`    ${field}: z.array(z.string())`)
                break;
            case "array.object":
                if(!schema[field].schema){
                    throw new Error("array.object fields must have a schema")
                }
                fields.push(`    ${field}: z.array(
z.object({${generateEntitySchema(schema[field].schema)}})
    )`)
                break;
            default:
                throw new Error("Unsupported type " + schema[field].type)
        }
    }
    content += fields.join(",\n")
    return content;
}

export const TemplateSchema = (entity: IEntitySchema) => `
import { z } from 'zod';

const ${entity.name}Schema = z.object({
  ${generateEntitySchema(entity.schema)}
});

export default ${entity.name}Schema;
export {${entity.name}Schema}
`
