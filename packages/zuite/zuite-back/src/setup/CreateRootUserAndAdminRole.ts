import {CreateUserIfNotExist, CreateOrUpdateRole} from "@drax/identity-back";
import rootUser from "./data/users/root-user.js";
import adminRole from "./data/roles/admin-role.js";

async function CreateRootUserAndAdminRole(){
    await CreateOrUpdateRole(adminRole)
    await CreateUserIfNotExist(rootUser)
}

export default CreateRootUserAndAdminRole

export {
    CreateRootUserAndAdminRole
}
