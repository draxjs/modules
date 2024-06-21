import MongoDb from './databases/MongoDB.js'
import YogaFastifyServerFactory from './factories/YogaFastifyServerFactory.js'

if(process.env.DB_ENGINE === 'mongo'){
    MongoDb()
}


import {PermissionService, IdentityPermissions} from "@drax/identity-back";

console.log("IdentityPermissions",Object.values(IdentityPermissions))

for(const permission of Object.values(IdentityPermissions)){
    PermissionService.addPermission(permission)
}

const serverYogaFastify = YogaFastifyServerFactory()
await serverYogaFastify.start(8082);
