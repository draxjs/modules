import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import {AbstractFastifyController} from "@drax/crud-back";
import {ValidationError, UnauthorizedError} from "@drax/common-back";

import UserApiKeyServiceFactory from "../factory/UserApiKeyServiceFactory.js";
import UserApiKeyService from "../services/UserApiKeyService.js";
import UserApiKeyPermissions from "../permissions/UserApiKeyPermissions.js";

class UserApiKeyController extends AbstractFastifyController<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase>   {

    protected service: UserApiKeyService

    constructor() {
        super(UserApiKeyServiceFactory(), UserApiKeyPermissions)
    }


    async paginate(request, reply) {
        try {
            request.rbac.assertAuthenticated()

            request.rbac.assertOrPermissions([
                UserApiKeyPermissions.View,
                UserApiKeyPermissions.ViewMy
            ])

            const filters = []

            if(!request.rbac.hasPermission(UserApiKeyPermissions.View)){
                filters.push({field: "user", operator: "eq", value: request.rbac.authUser.id})
            }

            const page = request.query.page
            const limit = request.query.limit
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search
            const userApiKeyService = UserApiKeyServiceFactory()


            let paginateResult = await userApiKeyService.paginate({page, limit, orderBy, order, search, filters})
            return paginateResult
        } catch (e) {
            console.log("/api/user-api-keys",e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }

    }

    async create(request, reply) {
        try {
            request.rbac.assertPermission(UserApiKeyPermissions.Create)
            const payload = request.body
            payload.user = request.rbac.authUser.id

            const userApiKeyService = UserApiKeyServiceFactory()

            let userApiKey = await userApiKeyService.create(payload)
            return userApiKey
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }

    }


    async update(request, reply) {
        try {
            request.rbac.assertPermission(UserApiKeyPermissions.Update)
            const id = request.params.id
            const payload = request.body
            const userApiKeyService = UserApiKeyServiceFactory()
            let userApiKey = await userApiKeyService.update(id, payload)
            return userApiKey
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            }
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }

    }

    async delete(request, reply) : Promise<void>  {
        try {
            request.rbac.assertPermission(UserApiKeyPermissions.Delete)
            const id = request.params.id
            const userApiKeyService = UserApiKeyServiceFactory()
            let r = await userApiKeyService.delete(id)
            if(r){
                reply.send({message: 'Deleted successfully'})
            }else{
                reply.statusCode(400).send({message: 'Not deleted'})
            }
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }

    }

}

export default UserApiKeyController;
export {
    UserApiKeyController
}

