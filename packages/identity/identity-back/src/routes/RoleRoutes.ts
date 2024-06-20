import {ValidationError} from "@drax/common-back";
import RoleServiceFactory from "../factory/RoleServiceFactory.js";
import {IRole} from "../interfaces/IRole";
import {IdentityPermissions} from "identity";

const roleService = RoleServiceFactory()

async function RoleRoutes(fastify, options) {

    fastify.get('/api/roles', async (request, reply): Promise<IRole[]> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewRole)
            let roles = await roleService.fetchAll()
            return roles
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

    fastify.post('/api/roles', async (request, reply): Promise<IRole> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.CreateRole)
            const payload = request.body
            let role = await roleService.create(payload)
            return role
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

    fastify.put('/api/roles/:id', async (request, reply): Promise<IRole> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.EditRole)
            const id = request.params.id
            const payload = request.body
            let role = await roleService.update(id, payload)
            return role
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

    fastify.delete('/api/roles/:id', async (request, reply): Promise<any> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.DeleteRole)
            const id = request.params.id
            let r = await roleService.delete(id)
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

export default RoleRoutes;
export {RoleRoutes}
