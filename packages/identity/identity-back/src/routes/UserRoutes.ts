import UserServiceFactory from "../factory/UserServiceFactory.js";
import {IUser} from "../interfaces/IUser";
import {IPaginateResult, ValidationError} from "@drax/common-back";
import {IdentityPermissions} from "identity";
import UnauthorizedError from "../errors/UnauthorizedError.js";

const userService = UserServiceFactory()

async function UserRoutes(fastify, options) {
    fastify.post('/api/auth', async (request, reply) => {
        try {
            const username = request.body.username
            const password = request.body.password
            console.log("/api/auth username", username)
            return await userService.auth(username, password)
        } catch (e) {
            if (e.message === "BadCredentials") {
                reply.code(401)
                reply.send({error: e.message})
            }
            console.error(e)
            throw e
        }
    })

    fastify.get('/api/me', async (request, reply): Promise<IUser | null> => {
        let user = await userService.findById(request.authUser.id)
        delete user.password
        return user
    })

    fastify.get('/api/users', async (request, reply): Promise<IPaginateResult> => {
        const page = request.query.page
        const limit = request.query.limit
        let paginateResult = await userService.paginate(page, limit)
        return paginateResult
    })

    fastify.post('/api/users', async (request, reply): Promise<IUser> => {
        try {
            const payload = request.body
            let user = await userService.create(payload)
            return user
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }

    })

    fastify.put('/api/users/:id', async (request, reply): Promise<IUser> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.EditUser)
            const id = request.params.id
            const payload = request.body
            let user = await userService.update(id, payload)
            return user
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            }else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    })

    fastify.delete('/api/users/:id', async (request, reply): Promise<any> => {
        try {
            const id = request.params.id
            let r = await userService.delete(id)
            return r
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    })

}

export default UserRoutes;
export {UserRoutes}
