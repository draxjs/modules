import type {IRoleBase} from "@drax/identity-share"
import RoleServiceFactory from "../factory/RoleServiceFactory.js"

async function CreateOrUpdateRole(roleData: IRoleBase) {
    const roleService = RoleServiceFactory()
    const role = await roleService.findByName(roleData.name)

    //Find child roles by name
    if(Array.isArray(roleData.childRoles) && roleData.childRoles.length > 0){
        roleData.childRoles = await Promise.all(roleData.childRoles.map(async (childRole) => {
            const role = await roleService.findByName(childRole)
            if(role){
                return role._id.toString()
            }else{
                return childRole
            }
        }))
    }

    if(role){
        console.log("RoleData",roleData)
        const r = await roleService.systemUpdate(role._id.toString(), roleData)
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
