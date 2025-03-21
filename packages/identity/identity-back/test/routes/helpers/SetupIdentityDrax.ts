import { LoadCommonConfigFromEnv} from "@drax/common-back";
import {LoadIdentityConfigFromEnv} from "@drax/identity-back";
import InitializePermissions from "./InitializePermissions.js";
import CreateRootUserAndAdminRole from "./CreateRootUserAndAdminRole.js";


async function SetupIdentityDrax(){

    //Load Identity Drax Config from enviroment variables
    LoadCommonConfigFromEnv()
    LoadIdentityConfigFromEnv()

    //Setup Permissions
    InitializePermissions()

    //Create Root User and Admin Role
    return await CreateRootUserAndAdminRole()

}

export default SetupIdentityDrax
export {SetupIdentityDrax}
