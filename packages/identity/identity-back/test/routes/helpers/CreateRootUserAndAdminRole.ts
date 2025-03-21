import {CreateOrUpdateRole} from "../../../src/setup/CreateOrUpdateRole";
import {CreateUserIfNotExist} from "../../../src/setup/CreateUserIfNotExist";
import rootUser from "../data/root-user";
import adminRole from "../data/admin-role";
import {IUser, IRole} from "@drax/identity-share";

async function CreateRootUserAndAdminRole(){
    const role:IRole = await CreateOrUpdateRole(adminRole)
    const user:IUser = await CreateUserIfNotExist(rootUser)
    return {user, role}
}

export default CreateRootUserAndAdminRole

export {
    CreateRootUserAndAdminRole
}
