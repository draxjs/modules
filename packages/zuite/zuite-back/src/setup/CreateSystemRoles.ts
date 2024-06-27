import {CreateOrUpdateRole} from "@drax/identity-back";
import supervisorRole from "./data/roles/supervisor-role.js";
import vendedorRole from "./data/roles/vendedor-role.js";

async function CreateSystemRoles(){
    await CreateOrUpdateRole(vendedorRole)
    await CreateOrUpdateRole(supervisorRole)
}

export default CreateSystemRoles

export {
    CreateSystemRoles
}
