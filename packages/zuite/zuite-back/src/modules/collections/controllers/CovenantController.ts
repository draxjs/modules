
import CovenantServiceFactory from "../factory/services/CovenantServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CovenantPermissions from "../permissions/CovenantPermissions.js";
import type {ICovenant, ICovenantBase} from "../interfaces/ICovenant";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import type {FastifyReply} from "fastify";
import {BadRequestError} from "@drax/common-back";

class CovenantController extends AbstractFastifyController<ICovenant, ICovenantBase, ICovenantBase>   {

    constructor() {
        super(CovenantServiceFactory.instance, CovenantPermissions)
        this.tenantField = "tenant";
        this.userField = "createdBy";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    preCreate(request : CustomRequest, payload:any){
        payload.updatedBy = request.rbac.getAuthUser.id
        return payload
    }

    preUpdate(request : CustomRequest, payload:any){
        payload.updatedBy = request.rbac.getAuthUser.id
        return payload
    }

    async exportExcel(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(this.permission.View)

            const query = request.query as Record<string, unknown>
            const date = typeof query.date === 'string' ? query.date : ''
            const group = typeof query.group === 'string' ? query.group : ''

            if (!date || !group) {
                throw new BadRequestError('date and group are required')
            }

            const permission = this.permission as Record<string, string | undefined>
            const globalPermissions = [permission.All, permission.ViewAll].filter((item): item is string => !!item)

            const createdBy = request.rbac.hasSomePermission(globalPermissions)
                ? undefined
                : request.rbac.userId

            const exported = await CovenantServiceFactory.instance.exportExcel(date, group, createdBy)

            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            reply.header('Content-Disposition', `attachment; filename="${exported.fileName}"`)

            return reply.send(exported.buffer)
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default CovenantController;
export {
    CovenantController
}
