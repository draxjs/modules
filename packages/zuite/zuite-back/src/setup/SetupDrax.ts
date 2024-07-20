import {DraxConfig, CommonConfig, MongooseConector, LoadCommonConfigFromEnv, COMMON} from "@drax/common-back";
import {IdentityConfig, LoadIdentityConfigFromEnv} from "@drax/identity-back";
import InitializePermissions from "./InitializePermissions.js";
import CreateRootUserAndAdminRole from "./CreateRootUserAndAdminRole.js";
import CreateSystemRoles from "./CreateSystemRoles.js";


async function SetupDrax(){

    //Load Identity Drax Config from enviroment variables
    LoadCommonConfigFromEnv()
    LoadIdentityConfigFromEnv()

    //Setup MongoDB connection if needed
    if(DraxConfig.getOrLoad(CommonConfig.DbEngine) === COMMON.DB_ENGINES.MONGODB){
        console.log('Connecting to MongoDB...')
        const mongooseUri = DraxConfig.getOrLoad(CommonConfig.MongoDbUri)
        const mongooseConector = new MongooseConector(mongooseUri)
        await mongooseConector.connect()
    }

    //Setup Permissions
    InitializePermissions()

    //Create Root User and Admin Role
    await CreateRootUserAndAdminRole()

    await CreateSystemRoles()
}

export default SetupDrax
export {SetupDrax}
