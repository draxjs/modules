import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "people",
    name: "Language",
    schema: {
        name: {type: 'string', required: true, unique: true, index: true, search:true, header: true},
    }
}


export default schema;
export {schema};
