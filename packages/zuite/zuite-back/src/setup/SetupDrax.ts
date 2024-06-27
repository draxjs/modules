import {DraxConfig, MongooseConector} from "@drax/common-back";
import {IdentityConfig, LoadIdentityConfigFromEnv} from "@drax/identity-back";
import InitializePermissions from "./InitializePermissions.js";
import CreateRootUserAndAdminRole from "./CreateRootUserAndAdminRole.js";
import CreateSystemRoles from "./CreateSystemRoles.js";


async function SetupDrax(){

    //Load Identity Drax Config from enviroment variables
    LoadIdentityConfigFromEnv()

    //Setup MongoDB connection if needed
    if(DraxConfig.get(IdentityConfig.DbEngine) === 'mongo'){
        const mongooseUri = DraxConfig.get(IdentityConfig.MongoDbUri)
        const mongooseConector = new MongooseConector(mongooseUri)
        mongooseConector.connect()
    }

    //Setup Permissions
    InitializePermissions()

    //Create Root User and Admin Role
    await CreateRootUserAndAdminRole()

    await CreateSystemRoles()
}

export default SetupDrax
export {SetupDrax}
