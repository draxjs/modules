import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "people",
    name: "Person",
    tabs: ["BASIC", "ADDRESS", "SKILLS", "MANAGE"],
    schema: {
        fullname: {groupTab:"BASIC", type: 'string', required: true, unique: true, index: true, search:true, header: true},
        live: {groupTab:"BASIC", type: 'boolean', required: false, unique: false, index: false, header: true},
        birthdate: {groupTab:"BASIC", type: 'date', required: false, unique: false, index: false, header: true},
        secret: {groupTab:"BASIC", type: 'password', required: false, unique: false, index: false, header: false},
        nationality: {groupTab:"BASIC", type: 'ref', ref:'Country', refDisplay: 'name', required: false, unique: false, index: false, header: true},
        hobbies: {groupTab:"BASIC", type: 'array.string', required: false, unique: false, index: false, search:true, header: true},
        race: {groupTab:"BASIC", type: 'enum', enum:["human","elf","orc"], required: false, unique: false, index: false, search:true, header: true},
        interests: {groupTab:"BASIC", type: 'array.enum', enum:["sports","music","reading","travel","cooking","technology"], default: ['sports', 'music'], required: false, unique: false, index: false, search:true, header: true},
        languages: {groupTab:"BASIC", type: 'array.ref', ref:'Language', refDisplay: 'name', required: false, unique: false, index: false, header: true},
        address: {
            groupTab:"ADDRESS",
            type: 'object', header: true, schema: {
                country: {type: 'string', required: false, unique: false, index: false},
                city: {type: 'string', required: false, unique: false, index: false},
                street: {type: 'longString', required: true, unique: false, index: false},
                zip: {type: 'number', required: false, unique: false, index: false},
                casa: {type: 'boolean', required: false, unique: false, index: false},
            }
        },
        skills: {
            groupTab:"SKILLS",
            type: 'array.object', header: false, schema: {
                name: {type: 'string', required: true, unique: false, index: false},
                level: {type: 'number', required: false, unique: false, index: false},
            }
        },
        tenant: {groupTab:"MANAGE", type: 'ref', ref:'Tenant', refDisplay: 'name', required: false, unique: false, index: false, header: true},
        user: {groupTab:"MANAGE", type: 'ref', ref:'User', refDisplay: 'username', required: false, unique: false, index: false, header: true},
    }
}


export default schema;
export {schema};
