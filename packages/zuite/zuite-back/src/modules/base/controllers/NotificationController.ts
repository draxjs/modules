
import NotificationServiceFactory from "../factory/services/NotificationServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import NotificationPermissions from "../permissions/NotificationPermissions.js";
import type {INotification, INotificationBase} from "../interfaces/INotification";
import type {FastifyReply} from "fastify";
import {LimitError, NotFoundError} from "@drax/common-back";
import {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {IDraxFieldFilter} from "@drax/crud-share";

class NotificationController extends AbstractFastifyController<INotification, INotificationBase, INotificationBase>   {

    constructor() {
        super(NotificationServiceFactory.instance, NotificationPermissions)
        this.tenantField = "tenant";
        this.userField = "user";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async paginate(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated()

            if (request.query.limit > this.maximumLimit) {
                throw new LimitError(this.maximumLimit, request.query.limit)
            }

            const page = request.query.page ? request.query.page : 1
            const limit = request.query.limit ? request.query.limit : 10
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search
            const filters: IDraxFieldFilter[] = this.parseFilters(request.query.filters)
            this.applyUserAndTenantFilters(filters, request.rbac);

            let paginateResult = await this.service.paginate({page, limit, orderBy, order, search, filters})
            return paginateResult
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async markAsRead(request: CustomRequest, reply: FastifyReply) {
        try {
            // Autenticación (si ya está garantizada por middleware, esto es solo respaldo)

            request?.rbac.assertAuthenticated()

            const id = request?.params?.id
            if (!id) {
                reply.statusCode = 400
                return reply.send({error: 'BAD REQUEST'})
            }

            const preItem = await this.service.findById(id)
            if (!preItem) {
                reply.statusCode = 404
                return reply.send({error: 'NOT_FOUND'})
            }

            // Solo el dueño puede marcarla como leída
            this.assertUser(preItem, request.rbac)

            // Idempotencia: si ya está leída, no tocar readAt
            if (preItem.status === 'read') {
                return preItem
            }

            const payload = {
                status: 'read',
                readAt: new Date()
            } as unknown as INotificationBase

            const item = await this.service.updatePartial(id, payload as any)

            if (!item) {
                throw new NotFoundError()
            }

            return item
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default NotificationController;
export {
    NotificationController
}

