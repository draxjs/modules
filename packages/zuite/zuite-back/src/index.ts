import {DraxConfig} from "@drax/common-back";
import {IdentityConfig, LoadConfigFromEnv} from "@drax/identity-back";
LoadConfigFromEnv()
import InitializePermissions from "./setup/InitializePermissions.js";
InitializePermissions()
import CreateRootUserAndAdminRole from "./setup/CreateRootUserAndAdminRole.js";
import MongoDb from './databases/MongoDB.js'
if(DraxConfig.get(IdentityConfig.DbEngine) === 'mongo'){
    MongoDb()
}
await CreateRootUserAndAdminRole()




import YogaFastifyServerFactory from './factories/YogaFastifyServerFactory.js'
const serverYogaFastify = YogaFastifyServerFactory()
await serverYogaFastify.start(8082);
