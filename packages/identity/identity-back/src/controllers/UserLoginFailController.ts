
import UserLoginFailServiceFactory from "../factory/UserLoginFailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import UserLoginFailPermissions from "../permissions/UserLoginFailPermissions.js";
import type {IUserLoginFail, IUserLoginFailBase} from "@drax/identity-share";
import type {FastifyReply, FastifyRequest} from "fastify";
import {MethodNotAllowedError} from "@drax/common-back";

class UserLoginFailController extends AbstractFastifyController<IUserLoginFail, IUserLoginFailBase, IUserLoginFailBase>   {

    constructor() {
        super(UserLoginFailServiceFactory(), UserLoginFailPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = false;
        this.userFilter = true;
        this.tenantSetter = false;
        this.userSetter = true;
        this.tenantAssert = false;
        this.userAssert = true;
    }

    async create(request: FastifyRequest, reply: FastifyReply): Promise<IUserLoginFail> {
        try {
            throw new MethodNotAllowedError()
        } catch (e) {
            this.handleError(e, reply)
        }
        return null;
    }

    async update(request: FastifyRequest, reply: FastifyReply): Promise<IUserLoginFail> {
        try {
            throw new MethodNotAllowedError()
        } catch (e) {
            this.handleError(e, reply)
        }
        return null;
    }

    async updatePartial(request: FastifyRequest, reply: FastifyReply): Promise<IUserLoginFail> {
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

export default UserLoginFailController;
export {
    UserLoginFailController
}

