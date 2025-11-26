import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "identity-back",
    name: "UserLoginFail",
    apiBasePath:'user-login-fails',
    apiTag: 'Identity',
    schema: {
        user: {type: 'ref', ref:'User', refDisplay: 'username', required: true, unique: false, index: true, header: true},
        agent: {type: 'string', required: false, unique: false, index: false, search:true, header: true},
        ip: {type: 'string', required: false, unique: false, index: false, search:true, header: true},
        createdAt: {type: 'date', required: false, unique: false, index: false, search:false, header: true},
    },
}


export default schema;
export {schema};
