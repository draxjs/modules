import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "people",
    name: "Country",
    apiBasePath:'countries',
    apiTag: 'ABM',
    schema: {
        name: {type: 'string', required: true, unique: true, index: true, search:true, header: true},
        description: {type: 'longString', default:'Some Description', required: false, unique: false, index: false, search:false, header: true, groupMenu:'BASIC'},
        flag: {type: 'file', required: false, index:false, unique:false, header: true, groupMenu:'EXTENDED'},
        tenant: {type: 'ref', ref:'Tenant', refDisplay:'name', required: true, unique: false, index: true, search:true, header: true},
        createdBy: {type: 'ref', ref:'User', refDisplay:'username', required: true, unique: false, index: true, search:true, header: true},
    },
    menus:['BASIC','EXTENDED']
}


export default schema;
export {schema};
