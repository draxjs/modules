import {CreateOrUpdateRole} from "@drax/identity-back";
import supervisorRole from "./data/roles/supervisor-role.js";
import operatorRole from "./data/roles/operator-role.js";

async function CreateSystemRoles(){
    await CreateOrUpdateRole(operatorRole)
    await CreateOrUpdateRole(supervisorRole)
}

export default CreateSystemRoles

export {
    CreateSystemRoles
}
