import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "pets",
    name: "Pet",
    schema: {
        nombre: {type: 'string', required: true, unique: true, index: true, search:true, header: true},
        raza: {type: 'string', required: true, unique: false, index: true, search:true, header: true},
    }
}


export default schema;
export {schema};
