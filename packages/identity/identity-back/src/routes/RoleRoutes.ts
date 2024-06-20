import {IPaginateResult, ValidationError} from "@drax/common-back";
import RoleServiceFactory from "../factory/RoleServiceFactory.js";
import {IRole} from "../interfaces/IRole";
import {IdentityPermissions} from "../permissions/IdentityPermissions.js";
import {PermissionService} from "../services/PermissionService.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";

const roleService = RoleServiceFactory()

async function RoleRoutes(fastify, options) {

    fastify.get('/api/permissions', async (request, reply): Promise<string[]> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.PermissionsRole)
            let permissions = PermissionService.getPermissions()
            return permissions
        }catch (e){
            console.error(e)
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    })

    fastify.get('/api/roles/all', async (request, reply): Promise<IRole[]> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewRole)
            let roles = await roleService.fetchAll()
            return roles
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    })

    fastify.get('/api/roles', async (request, reply): Promise<IPaginateResult> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewRole)
            const page = request.query.page
            const limit = request.query.limit
            let paginateResult = await roleService.paginate(page, limit)
            return paginateResult
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    })

    fastify.post('/api/roles', async (request, reply): Promise<IRole> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.CreateRole)
            const payload = request.body
            let role = await roleService.create(payload)
            return role
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }

    })

    fastify.put('/api/roles/:id', async (request, reply): Promise<IRole> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.EditRole)
            const id = request.params.id
            const payload = request.body
            let role = await roleService.update(id, payload)
            return role
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }

    })

    fastify.delete('/api/roles/:id', async (request, reply): Promise<any> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.DeleteRole)
            const id = request.params.id
            let r = await roleService.delete(id)
            return r
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    })

}

export default RoleRoutes;
export {RoleRoutes}
