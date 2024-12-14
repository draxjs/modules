import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "drax-crud",
    name: "DynamicForm",
    schema: {
        identifier: {type: 'string', required: true, unique: true, index: true, search:true, header: true},
        fields: { type: 'array.object', required: false, unique: false, index: false, search:false, header: false,
            schema: {
                type: {type: 'enum', enum: ['string' , 'longString' , 'number' , 'boolean' , 'date' , 'object' , 'ref' , 'enum' , 'password' , 'file' ,'array.string' , 'array.number' , 'array.object' , 'array.ref' , 'array.enum' , 'array.file'], required: true, unique: false, index: false},
                name: {type: 'string', required: true, unique: false, index: false},
                default: {type: 'string', required: true, unique: false, index: false},
                required: {type: 'boolean', required: false, unique: false, index: false, default: false},
                validationRegex: {type: 'string', required: true, unique: false, index: false},
                enum: {type: 'array.string', required: true, unique: false, index: false},
                schema: {type: 'object', required: false, unique: false, index: false,
                    schema: {
                        type: {type: 'enum', enum: ['string' , 'longString' , 'number' , 'boolean' , 'date' , 'object' , 'ref' , 'enum' , 'password' , 'file' ,'array.string' , 'array.number' , 'array.object' , 'array.ref' , 'array.enum' , 'array.file'], required: true, unique: false, index: false},
                        name: {type: 'string', required: true, unique: false, index: false},
                        default: {type: 'string', required: true, unique: false, index: false},
                        required: {type: 'boolean', required: false, unique: false, index: false, default: false},
                        validationRegex: {type: 'string', required: true, unique: false, index: false},
                        enum: {type: 'array.string', required: true, unique: false, index: false},
                    }}
            }

        },
    }
}


export default schema;
export {schema};
