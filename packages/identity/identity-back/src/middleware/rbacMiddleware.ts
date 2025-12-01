import {IAuthUser, IRbac, IRole} from "@drax/identity-share";
import {DraxCache, DraxConfig} from "@drax/common-back";
import RoleServiceFactory from "../factory/RoleServiceFactory.js";
import Rbac from "../rbac/Rbac.js";
import IdentityConfig from "../config/IdentityConfig.js";

const cacheTTL = DraxConfig.getOrLoad(IdentityConfig.RbacCacheTTL) ? parseInt(DraxConfig.getOrLoad(IdentityConfig.RbacCacheTTL)) : 10000;
const draxCache = new DraxCache<IRole>(cacheTTL);


async function roleLoader(k):Promise<IRole | null> {
    const roleService = RoleServiceFactory()
    const role: IRole = await roleService.findById(k)
    return role
}

async function rbacMiddleware (request, reply) {
        try{
            if(request.authUser as IAuthUser){
                const authUser: IAuthUser = request.authUser
                const cacheKey = authUser.roleId
                const role : IRole = await draxCache.getOrLoad(cacheKey, roleLoader)
                const rbac: IRbac = new Rbac(authUser,role)
                request.rbac = rbac
            }else{
                const rbac: IRbac = new Rbac(null,null)
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
