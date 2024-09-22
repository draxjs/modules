import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "people",
    name: "Person",
    schema: {
        fullname: {type: 'string', required: true, unique: true, index: true, search:true, header: true},
        live: {type: 'boolean', required: false, unique: false, index: false, header: true},
        birthdate: {type: 'date', required: false, unique: false, index: false, header: true},
        nationality: {type: 'ref', ref:'Country', required: false, unique: false, index: false, header: true},
        hobbies: {type: 'array.string', required: false, unique: false, index: false, search:true, header: true},
        languages: {type: 'array.ref', ref:'Language', required: false, unique: false, index: false, header: true},
        address: {
            type: 'object', header: true, schema: {
                country: {type: 'string', required: false, unique: false, index: false},
                city: {type: 'string', required: false, unique: false, index: false},
                street: {type: 'string', required: false, unique: false, index: false},
                zip: {type: 'string', required: false, unique: false, index: false},
            }
        },
        skills: {
            type: 'array.object', header: false, schema: {
                name: {type: 'string', required: false, unique: false, index: false},
                level: {type: 'number', required: false, unique: false, index: false},
            }
        }
    }
}


export default schema;
export {schema};
