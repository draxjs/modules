import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "people",
    name: "Country",
    schema: {
        name: {type: 'string', required: true, unique: true, index: true, search:true, header: true},
        flag: {type: 'file', required: false, index:false, unique:false, header: true},
    }
}


export default schema;
export {schema};
