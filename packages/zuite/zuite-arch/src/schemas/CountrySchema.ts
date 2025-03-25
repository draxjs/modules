import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "people",
    name: "Country",
    apiBasePath:'countries',
    apiTag: 'ABM',
    schema: {
        name: {type: 'string', required: true, unique: true, index: true, search:true, header: true},
        description: {type: 'longString', required: false, unique: false, index: false, search:false, header: true},
        flag: {type: 'file', required: false, index:false, unique:false, header: true},
    }
}


export default schema;
export {schema};
