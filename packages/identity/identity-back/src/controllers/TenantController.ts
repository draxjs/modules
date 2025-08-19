import type {ITenant, ITenantBase} from "@drax/identity-share";
import {AbstractFastifyController} from "@drax/crud-back";
import {ValidationError, UnauthorizedError} from "@drax/common-back";

import TenantServiceFactory from "../factory/TenantServiceFactory.js";
import TenantService from "../services/TenantService.js";
import TenantPermissions from "../permissions/TenantPermissions.js";
import UserPermissions from "../permissions/UserPermissions.js";

class TenantController extends AbstractFastifyController<ITenant, ITenantBase, ITenantBase>   {

    protected service: TenantService

    constructor() {
        super(TenantServiceFactory(), TenantPermissions)
    }

    async all(request, reply) {
        try {
            request.rbac.assertPermission(this.permission.View)
            let tenants = await this.service.fetchAll()
            if(request.rbac.getAuthUser.tenantId && !request.rbac.hasPermission(UserPermissions.SwitchTenant)){
                return tenants.filter(t => t._id === request.rbac.getAuthUser.tenantId)
            }else{
                return tenants
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

}

export default TenantController;
export {
    TenantController
}

