import type {IRole, IRoleBase} from "@drax/identity-share";
import {AbstractFastifyController} from "@drax/crud-back";
import {ValidationError, UnauthorizedError} from "@drax/common-back";

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
            return role
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async all(request, reply) {
        try {
            request.rbac.assertPermission(RolePermissions.View)
            const roleService = RoleServiceFactory()
            let roles = await roleService.fetchAll()
            if(request.rbac.getRole?.childRoles?.length > 0) {
                return roles.filter(role => request.rbac.getRole.childRoles.some(childRole => childRole.id === role.id));
            }else{
                return roles
            }
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async permissions(request, reply) {
        try {
            request.rbac.assertPermission(RolePermissions.Permissions)
            let permissions = PermissionService.getPermissions()
            return permissions
        }catch (e){
            console.error(e)
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }



    async xxxx(request, reply) {

    }

}

export default RoleController;
export {
    RoleController
}

