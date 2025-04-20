import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "people",
    name: "Person",
    tabs: ["BASIC", "ADDRESS", "SKILLS", "MANAGE"],
    schema: {
        fullname: {tab:"BASIC", type: 'string', required: true, unique: true, index: true, search:true, header: true},
        live: {tab:"BASIC", type: 'boolean', required: false, unique: false, index: false, header: true},
        birthdate: {tab:"BASIC", type: 'date', required: false, unique: false, index: false, header: true},
        secret: {tab:"BASIC", type: 'password', required: false, unique: false, index: false, header: false},
        nationality: {tab:"BASIC", type: 'ref', ref:'Country', refDisplay: 'name', required: false, unique: false, index: false, header: true},
        hobbies: {tab:"BASIC", type: 'array.string', required: false, unique: false, index: false, search:true, header: true},
        race: {tab:"BASIC", type: 'enum', enum:["human","elf","orc"], required: false, unique: false, index: false, search:true, header: true},
        interests: {tab:"BASIC", type: 'array.enum', enum:["sports","music","reading","travel","cooking","technology"], default: ['sports', 'music'], required: false, unique: false, index: false, search:true, header: true},
        languages: {tab:"BASIC", type: 'array.ref', ref:'Language', refDisplay: 'name', required: false, unique: false, index: false, header: true},
        address: {
            tab:"ADDRESS",
            type: 'object', header: true, schema: {
                country: {type: 'string', required: false, unique: false, index: false},
                city: {type: 'string', required: false, unique: false, index: false},
                street: {type: 'longString', required: true, unique: false, index: false},
                zip: {type: 'number', required: false, unique: false, index: false},
                casa: {type: 'boolean', required: false, unique: false, index: false},
            }
        },
        skills: {
            tab:"SKILLS",
            type: 'array.object', header: false, schema: {
                name: {type: 'string', required: true, unique: false, index: false},
                level: {type: 'number', required: false, unique: false, index: false},
            }
        },
        tenant: {tab:"MANAGE", type: 'ref', ref:'Tenant', refDisplay: 'name', required: false, unique: false, index: false, header: true},
        user: {tab:"MANAGE", type: 'ref', ref:'User', refDisplay: 'username', required: false, unique: false, index: false, header: true},
    }
}


export default schema;
export {schema};
