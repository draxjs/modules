import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";

const generateEntityInterface = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){
        switch (schema[field].type) {
            case "string":
            case "password":
            case "enum":
            case "longString":
            case "file":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: string`)
                break;
            case "number":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: number`)
                break;
            case "boolean":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: boolean`)
                break;
            case "date":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: Date`)
                break;
            case "ref":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: any`)
                break;
            case "fullFile":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: {
                filename: string,
                filepath: string,
                size: number,
                mimetype?: string,
                url: string
                }`)
                break;
            case "object":
                if(!schema[field].schema){
                    throw new Error("object fields must have a schema")
                }
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: {${generateEntityInterface(schema[field].schema)}}`)
                break;
            case "array.string":
            case "array.enum":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: Array<string>`)
                break;
            case "array.number":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: Array<number>`)
                break;
            case "array.ref":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: Array<any>`)
                break;
            case "array.fullFile":
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: Array<{
                filename: string,
                filepath: string,
                size: number,
                mimetype?: string,
                url: string
                }>`)
                break;
            case "array.object":
                if(!schema[field].schema){
                    throw new Error("array.object fields must have a schema")
                }
                fields.push(`    ${field}${!schema[field].required ? "?" : ""}: Array<{
${generateEntityInterface(schema[field].schema)}
    }>`)
                break;
            default:
                throw new Error("Unsupported type " + schema[field].type)
        }
    }
    content += fields.join("\n")
    return content;
}


export const TemplateEntityInterface = (entity: IEntitySchema) => `
interface I${entity.name}Base {
${generateEntityInterface(entity.schema)}
    createdAt?: Date
    updatedAt?: Date
}

interface I${entity.name} {
    _id: string
${generateEntityInterface(entity.schema)}
    createdAt?: Date
    updatedAt?: Date
}

export type {
I${entity.name}Base, 
I${entity.name}
}
`
