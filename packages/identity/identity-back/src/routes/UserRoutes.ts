import UserServiceFactory from "../factory/UserServiceFactory.js";
import {IUser} from "../interfaces/IUser";
import {IPaginateResult, ValidationError} from "@drax/common-back";
import {IdentityPermissions} from "../permissions/IdentityPermissions.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import BadCredentialsError from "../errors/BadCredentialsError.js";

const userService = UserServiceFactory

async function UserRoutes(fastify, options) {
    fastify.post('/api/auth', async (request, reply) => {
        try {
            const username = request.body.username
            const password = request.body.password
            return await userService.auth(username, password)
        } catch (e) {
            console.error('/api/auth error', e)
            if (e instanceof BadCredentialsError) {
                reply.code(401)
                reply.send({error: e.message})
            }
            reply.code(500)
            reply.send({error: 'error.server'})
        }
    })




    fastify.get('/api/me', async (request, reply): Promise<IUser | null> => {
        try {
            if (request.authUser) {
                let user = await userService.findById(request.authUser.id)
                delete user.password
                return user
            } else {
                throw new UnauthorizedError()

            }
        } catch (e) {
            if (e instanceof UnauthorizedError) {
                reply.code(401)
                reply.send({error: "Unauthorized"})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }


    })

    fastify.get('/api/users', async (request, reply): Promise<IPaginateResult> => {

        try {
            request.rbac.assertPermission(IdentityPermissions.ViewUser)
            const page = request.query.page
            const limit = request.query.limit
            const search = request.query.search
            let paginateResult = await userService.paginate(page, limit, search)
            return paginateResult
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

    fastify.post('/api/users', async (request, reply): Promise<IUser> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.CreateUser)
            const payload = request.body
            let user = await userService.create(payload)
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

    fastify.put('/api/users/:id', async (request, reply): Promise<IUser> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.UpdateUser)
            const id = request.params.id
            const payload = request.body
            let user = await userService.update(id, payload)
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

    fastify.delete('/api/users/:id', async (request, reply): Promise<any> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.DeleteUser)
            const id = request.params.id
            let r = await userService.delete(id)
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

    fastify.post('/api/password', async (request, reply) => {
        try {
            if(!request.authUser){
                throw new UnauthorizedError()
            }
            const userId = request.authUser.id
            const currentPassword = request.body.currentPassword
            const newPassword = request.body.newPassword
            return await userService.changeOwnPassword(userId, currentPassword, newPassword)
        } catch (e) {
            console.error('/api/password error', e)
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


    fastify.post('/api/password/:id', async (request, reply) => {
        try {
            request.rbac.assertPermission(IdentityPermissions.UpdateUser)
            const userId = request.params.id
            if(!userId){
                throw new UnauthorizedError()
            }
            const newPassword = request.body.newPassword

            return await userService.changeUserPassword(userId, newPassword)
        } catch (e) {
            console.error('/api/password error', e)
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

export default UserRoutes;
export {UserRoutes}
