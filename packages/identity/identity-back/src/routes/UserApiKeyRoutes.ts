import UserApiKeyServiceFactory from "../factory/UserApiKeyServiceFactory.js";
import type {IUserApiKey} from "@drax/identity-share";
import {ValidationError} from "@drax/common-back";
import {IdentityPermissions} from "../permissions/IdentityPermissions.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import {IDraxPaginateResult} from "@drax/common-share";


async function UserApiKeyRoutes(fastify, options) {

    fastify.get('/api/user-api-keys', async (request, reply): Promise<IDraxPaginateResult<IUserApiKey>> => {

        try {
            request.rbac.assertAuthenticated()

            request.rbac.assertOrPermissions([
                IdentityPermissions.ViewUserApiKey,
                IdentityPermissions.ViewMyUserApiKey
            ])

            const filters = []

            if(!request.rbac.hasPermission(IdentityPermissions.ViewUserApiKey)){
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
    })

    fastify.post('/api/user-api-keys', async (request, reply): Promise<IUserApiKey> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.CreateUserApiKey)
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

    })

    fastify.put('/api/user-api-keys/:id', async (request, reply): Promise<IUserApiKey> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.UpdateUserApiKey)
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
    })

    fastify.delete('/api/user-api-keys/:id', async (request, reply): Promise<any> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.DeleteUserApiKey)
            const id = request.params.id
            const userApiKeyService = UserApiKeyServiceFactory()
            let r = await userApiKeyService.delete(id)
            return r
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
    })


}

export default UserApiKeyRoutes;
export {UserApiKeyRoutes}
