import AuditServiceFactory from "../factory/services/AuditServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import AuditPermissions from "../permissions/AuditPermissions.js";
import type {IAudit, IAuditBase} from "@drax/audit-share";
import type {FastifyReply, FastifyRequest} from "fastify";
import {MethodNotAllowedError} from "@drax/common-back";

class AuditController extends AbstractFastifyController<IAudit, IAuditBase, IAuditBase> {

    constructor() {
        super(AuditServiceFactory.instance, AuditPermissions)
        this.tenantField = "tenant.id";
        this.userField = "user";
        this.tenantFilter = true;
        this.userFilter = false;
        this.tenantSetter = false;
        this.userSetter = false;
        this.tenantAssert = false;
        this.userAssert = false;
    }

    async create(request: FastifyRequest, reply: FastifyReply): Promise<IAudit> {
        try {
            throw new MethodNotAllowedError()
        } catch (e) {
            this.handleError(e, reply)
        }
        return null;
    }

    async update(request: FastifyRequest, reply: FastifyReply): Promise<IAudit> {
        try {
            throw new MethodNotAllowedError()
        } catch (e) {
            this.handleError(e, reply)
        }
        return null;
    }

    async updatePartial(request: FastifyRequest, reply: FastifyReply): Promise<IAudit> {
        try {
            throw new MethodNotAllowedError()
        } catch (e) {
            this.handleError(e, reply)
        }
        return null;
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            throw new MethodNotAllowedError()
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default AuditController;
export {
    AuditController
}

