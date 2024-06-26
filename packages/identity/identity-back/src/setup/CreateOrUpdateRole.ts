import type {IRoleBase} from "@drax/identity-share"
import RoleServiceFactory from "../factory/RoleServiceFactory.js"

async function CreateOrUpdateRole(roleData: IRoleBase) {
    const roleService = RoleServiceFactory()
    const role = await roleService.findByName(roleData.name)
    if(role){
        const r = await roleService.update(role.id, roleData)
        console.log("Role Updated. Name: "+ roleData.name)
    }else{
        const r = await roleService.create(roleData)
        console.log("Role Created. Name: "+ roleData.name)
    }
}

export default CreateOrUpdateRole
export {
    CreateOrUpdateRole
}
