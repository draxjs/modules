import type {IJwtUser} from "../interfaces/IJwtUser";
import type {IRole, IRoleBase} from "../interfaces/IRole";
import {DraxCache, DraxConfig} from "@drax/common-back";
import RoleServiceFactory from "../factory/RoleServiceFactory.js";
import Rbac from "../rbac/Rbac.js";
import IdentityConfig from "../config/IdentityConfig.js";

const cacheTTL = DraxConfig.getOrLoad(IdentityConfig.RbacCacheTTL) ? parseInt(DraxConfig.getOrLoad(IdentityConfig.RbacCacheTTL)) : 10000;
const draxCache = new DraxCache<IRoleBase>(cacheTTL);
const roleService = RoleServiceFactory()

async function roleLoader(k):Promise<IRoleBase | null> {
    const role: IRole = await roleService.findById(k)
    if(role){
        return {id: role.id, name: role.name, permissions: role.permissions} as IRoleBase
    }
    return null
}

async function rbacMiddleware (request, reply) {
        try{
            //console.log("rbacMiddleware authUser",request.authUser)
            if(request.authUser as IJwtUser){
                const authUser = request.authUser
                const cacheKey= authUser.roleId
                const role = await draxCache.getOrLoad(cacheKey, roleLoader)
                const rbac = new Rbac(authUser,role)
                request.rbac = rbac
            }else{
                const rbac = new Rbac(null,null)
                request.rbac = rbac
            }
            return
        }catch (e) {
            console.error(e)
            reply.code(500).send({ error: 'RBAC ERROR' });
        }
}

export default rbacMiddleware;
export {rbacMiddleware}
