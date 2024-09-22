import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";

const generateEntityInterface = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    for(const field in schema){
        switch (schema[field].type) {
            case "string":
                fields.push(`    ${field}: string`)
                break;
            case "number":
                fields.push(`    ${field}: number`)
                break;
            case "boolean":
                fields.push(`    ${field}: boolean`)
                break;
            case "date":
                fields.push(`    ${field}: Date`)
                break;
            case "ref":
                fields.push(`    ${field}: any`)
                break;
            case "object":
                if(!schema[field].schema){
                    throw new Error("object fields must have a schema")
                }
                fields.push(`    ${field}: {${generateEntityInterface(schema[field].schema)}}`)
                break;
            case "array.string":
                fields.push(`    ${field}: Array<string>`)
                break;
            case "array.number":
                fields.push(`    ${field}: Array<number>`)
                break;
            case "array.ref":
                fields.push(`    ${field}: Array<any>`)
                break;
            case "array.object":
                if(!schema[field].schema){
                    throw new Error("array.object fields must have a schema")
                }
                fields.push(`    ${field}: Array<{
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
    id: string
${generateEntityInterface(entity.schema)}
    createdAt?: Date
    updatedAt?: Date
}

export type {
I${entity.name}Base, 
I${entity.name}
}
`
