import {IEntitySchema, IFieldSchema, ISchema, IType} from "../../../interfaces/IEntitySchema";

const generateModelSchema = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []


    function mapType(type: IType){
        switch (type) {
            case "string":
            case "password":
                return "String";
            case "number":
                return "Number";
            case "boolean":
                return "Boolean";
            case "date":
                return "Date";
            case "ref":
                return "mongoose.Schema.Types.ObjectId";
            case "enum":
                return "String";
            default:
                throw new Error("Unsupported type " + type)
        }
    }

    function generateField(field:IFieldSchema, fieldType: IType){
        return `{type: ${mapType(fieldType)}, ${fieldType === 'ref' ? "ref: '"+ field.ref + "'," : "" } ${fieldType === 'enum' ? "enum: ['"+ field.enum.join("', '") + "']," : "" } required: ${field.required}, index: ${field.index}, unique: ${field.unique} }`
    }

    function generateArrayField(field:IFieldSchema){
        const fieldType: any = field.type.split(".")[1]
        if(fieldType === "object" && field.schema){
            return `[{ 
            ${generateModelSchema(field.schema)} 
            }]`
        }else{
            return `[${generateField(field, fieldType)}]`
        }
    }

    for(const field in schema){

        if(schema[field].type === 'object' && schema[field].schema){
            fields.push(`            ${field}: {
${generateModelSchema(schema[field].schema)} 
            }`)
        }else if(/array/.test(schema[field].type)){
            fields.push(`            ${field}: ${generateArrayField(schema[field])}`)
        }else{
            fields.push(`            ${field}: ${generateField(schema[field], schema[field].type)}`)
        }
    }

    content += fields.join(",\n")

    return content;
}

export const TemplateMongoModel = (entity: IEntitySchema) => `
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {I${entity.name}} from '../interfaces/I${entity.name}'

const ${entity.name}Schema = new mongoose.Schema<I${entity.name}>({
${generateModelSchema(entity.schema)}
}, {timestamps: true});

${entity.name}Schema.plugin(uniqueValidator, {message: 'validation.unique'});
${entity.name}Schema.plugin(mongoosePaginate);

const MODEL_NAME = '${entity.name}';
const COLLECTION_NAME = '${entity.name}';
const ${entity.name}Model = mongoose.model<I${entity.name}, PaginateModel<I${entity.name}>>(MODEL_NAME, ${entity.name}Schema,COLLECTION_NAME);

export {
    ${entity.name}Schema,
    ${entity.name}Model
}

export default ${entity.name}Model
`

