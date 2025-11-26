
import UserSessionServiceFactory from "../factory/UserSessionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import UserSessionPermissions from "../permissions/UserSessionPermissions.js";
import type {IUserSession, IUserSessionBase} from "@drax/identity-share";
import type {FastifyReply, FastifyRequest} from "fastify";
import {MethodNotAllowedError} from "@drax/common-back";

class UserSessionController extends AbstractFastifyController<IUserSession, IUserSessionBase, IUserSessionBase>   {

    constructor() {
        super(UserSessionServiceFactory(), UserSessionPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = false;
        this.userFilter = true;
        this.tenantSetter = false;
        this.userSetter = true;
        this.tenantAssert = false;
        this.userAssert = true;
    }

    async create(request: FastifyRequest, reply: FastifyReply): Promise<IUserSession> {
        try {
            throw new MethodNotAllowedError()
        } catch (e) {
            this.handleError(e, reply)
        }
        return null;
    }

    async update(request: FastifyRequest, reply: FastifyReply): Promise<IUserSession> {
        try {
            throw new MethodNotAllowedError()
        } catch (e) {
            this.handleError(e, reply)
        }
        return null;
    }

    async updatePartial(request: FastifyRequest, reply: FastifyReply): Promise<IUserSession> {
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

export default UserSessionController;
export {
    UserSessionController
}

