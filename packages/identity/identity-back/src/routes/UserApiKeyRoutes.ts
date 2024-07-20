import UserServiceFactory from "../factory/UserServiceFactory.js";
import {IUser} from "@drax/identity-share";
import {ValidationError} from "@drax/common-back";
import {IdentityPermissions} from "../permissions/IdentityPermissions.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import {IDraxPaginateResult} from "@drax/common-share";


async function UserApiKeyRoutes(fastify, options) {

    fastify.get('/api/user_api_keys', async (request, reply): Promise<IDraxPaginateResult<IUser>> => {

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
            const orderDesc = request.query.orderDesc
            const search = request.query.search
            const userApiKeyService = UserServiceFactory()


            let paginateResult = await userApiKeyService.paginate({page, limit, orderBy, orderDesc, search, filters})
            return paginateResult
        } catch (e) {
            console.log("/api/user_api_keys",e)
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

    fastify.post('/api/user_api_keys', async (request, reply): Promise<IUser> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.CreateUser)
            const payload = request.body
            payload.user = request.rbac.authUser.id

            const userApiKeyService = UserServiceFactory()

            let user = await userApiKeyService.create(payload)
            return user
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

    fastify.put('/api/user_api_keys/:id', async (request, reply): Promise<IUser> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.UpdateUser)
            const id = request.params.id
            const payload = request.body
            const userApiKeyService = UserServiceFactory()
            if(request.rbac.getAuthUser.tenantId){
                payload.tenant = request.rbac.getAuthUser.tenantId
            }
            let user = await userApiKeyService.update(id, payload)
            return user
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

    fastify.delete('/api/user_api_keys/:id', async (request, reply): Promise<any> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.DeleteUser)
            const id = request.params.id
            const userApiKeyService = UserServiceFactory()
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
