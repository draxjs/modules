import { ValidationError} from "@drax/common-back";
import TenantServiceFactory from "../factory/TenantServiceFactory.js";
import {ITenant} from "@drax/identity-share";
import {IdentityPermissions} from "../permissions/IdentityPermissions.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import {IDraxPaginateResult} from "@drax/common-share";



async function TenantRoutes(fastify, options) {

    fastify.get('/api/tenants/:id', async (request, reply): Promise<ITenant> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewTenant)
            const id = request.params.id
            const tenantService = TenantServiceFactory()
            let tenant = await tenantService.findById(id)
            return tenant
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

    fastify.get('/api/tenants/name/:name', async (request, reply): Promise<ITenant> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewTenant)
            const name = request.params.name
            const tenantService = TenantServiceFactory()
            let tenant = await tenantService.findByName(name)
            return tenant
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

    fastify.get('/api/tenants/all', async (request, reply): Promise<ITenant[]> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewTenant)
            const tenantService = TenantServiceFactory()
            let tenants = await tenantService.fetchAll()
            if(request.rbac.getAuthUser.tenantId){
                return tenants.filter(t => t.id === request.rbac.getAuthUser.tenantId)
            }else{
                return tenants
            }
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

    fastify.get('/api/tenants', async (request, reply): Promise<IDraxPaginateResult<ITenant>> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.ViewTenant)
            const page = request.query.page
            const limit = request.query.limit
            const orderBy = request.query.orderBy
            const orderDesc = request.query.orderDesc
            const search = request.query.search
            const tenantService = TenantServiceFactory()
            let paginateResult = await tenantService.paginate({page, limit,orderBy, orderDesc, search})
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

    fastify.post('/api/tenants', async (request, reply): Promise<ITenant> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.CreateTenant)
            const payload = request.body
            const tenantService = TenantServiceFactory()
            let tenant = await tenantService.create(payload)
            return tenant
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

    fastify.put('/api/tenants/:id', async (request, reply): Promise<ITenant> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.UpdateTenant)
            const id = request.params.id
            const payload = request.body
            const tenantService = TenantServiceFactory()

            let tenant = await tenantService.update(id, payload)
            return tenant
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

    fastify.delete('/api/tenants/:id', async (request, reply): Promise<any> => {
        try {
            request.rbac.assertPermission(IdentityPermissions.DeleteTenant)
            const id = request.params.id
            const tenantService = TenantServiceFactory()
            let r = await tenantService.delete(id)
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

export default TenantRoutes;
export {TenantRoutes}
