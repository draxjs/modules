import {IPaginateResult, ValidationError} from "@drax/common-back";
import RoleServiceFactory from "../factory/RoleServiceFactory.js";
import {IRole} from "../interfaces/IRole";
import {IdentityPermissions} from "../permissions/IdentityPermissions.js";
import {PermissionService} from "../services/PermissionService.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";



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

    fastify.get('/api/roles/:id', async (request, reply): Promise<IRole> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewRole)
            const id = request.params.id
            const roleService = RoleServiceFactory()
            let role = await roleService.findById(id)
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

    fastify.get('/api/roles/name/:name', async (request, reply): Promise<IRole> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewRole)
            const name = request.params.name
            const roleService = RoleServiceFactory()
            let role = await roleService.findByName(name)
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

    fastify.get('/api/roles/all', async (request, reply): Promise<IRole[]> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewRole)
            const roleService = RoleServiceFactory()
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
            const search = request.query.search
            const roleService = RoleServiceFactory()
            let paginateResult = await roleService.paginate(page, limit, search)
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
            const roleService = RoleServiceFactory()
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
            request.rbac.assertPermission(IdentityPermissions.UpdateRole)
            const id = request.params.id
            const payload = request.body
            const roleService = RoleServiceFactory()
            const currentRole = await roleService.findById(id)
            if(currentRole.readonly){
                throw new ValidationError([{field:'name', reason:"role.readonly", value:payload.name}])
            }

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
            const roleService = RoleServiceFactory()
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
