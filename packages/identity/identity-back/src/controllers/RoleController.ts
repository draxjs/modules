import type {IRole, IRoleBase} from "@drax/identity-share";
import {AbstractFastifyController} from "@drax/crud-back";
import { NotFoundError} from "@drax/common-back";

import RoleServiceFactory from "../factory/RoleServiceFactory.js";
import RoleService from "../services/RoleService.js";
import RolePermissions from "../permissions/RolePermissions.js";
import PermissionService from "../services/PermissionService.js";

class RoleController extends AbstractFastifyController<IRole, IRoleBase, IRoleBase>   {

    protected service: RoleService

    constructor() {
        super(RoleServiceFactory(), RolePermissions)
    }

    async findByName(request, reply) {
        try {
            request.rbac.assertPermission(RolePermissions.View)
            const name = request.params.name
            const roleService = RoleServiceFactory()
            let role = await roleService.findByName(name)
            if(!role){
                throw new NotFoundError()
            }
            return role
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async all(request, reply) {
        try {
            request.rbac.assertPermission(RolePermissions.View)
            const roleService = RoleServiceFactory()
            let roles = await roleService.fetchAll()
            if(request.rbac.getRole?.childRoles?.length > 0) {
                return roles.filter(role => request.rbac.getRole.childRoles.some(childRole => childRole._id?.toString() === role._id?.toString()));
            }else{
                return roles
            }
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async permissions(request, reply) {
        try {
            request.rbac.assertPermission(RolePermissions.Permissions)
            let permissions = PermissionService.getPermissions()
            return permissions
        }catch (e){
            this.handleError(e,reply)
        }
    }



}

export default RoleController;
export {
    RoleController
}

