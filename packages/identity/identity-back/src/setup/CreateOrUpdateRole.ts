import type {IRoleBase, IRole} from "@drax/identity-share"
import RoleServiceFactory from "../factory/RoleServiceFactory.js"

async function CreateOrUpdateRole(roleData: IRoleBase):Promise<IRole> {
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
        const r = await roleService.systemUpdate(role._id.toString(), roleData)
        console.log("Role Updated. Name: "+ roleData.name)
        return r
    }else{
        const r = await roleService.create(roleData)
        console.log("Role Created. Name: "+ roleData.name)
        return r
    }
}

export default CreateOrUpdateRole
export {
    CreateOrUpdateRole
}
