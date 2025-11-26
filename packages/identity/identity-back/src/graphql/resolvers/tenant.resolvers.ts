import TenantServiceFactory from "../../factory/TenantServiceFactory.js";
import {TenantPermissions} from "../../permissions/TenantPermissions.js";
import {ValidationError, ValidationErrorToGraphQLError, UnauthorizedError} from "@drax/common-back";
import {GraphQLError} from "graphql";
import {IDraxPaginateOptions} from "@drax/crud-share";


export default {
    Query: {
        findTenantById: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(TenantPermissions.View)
                const tenantService = TenantServiceFactory()
                return await tenantService.findById(id)
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        findTenantByName: async (_, {name}, {rbac}) => {
            try {
                rbac.assertPermission(TenantPermissions.View)
                const tenantService = TenantServiceFactory()
                return await tenantService.findByName(name)
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        fetchTenant: async (_, {}, {rbac}) => {
            try {
                rbac.assertPermission(TenantPermissions.View)
                const tenantService = TenantServiceFactory()
                const tenants =  await tenantService.fetchAll()
                if(rbac.getAuthUser.tenantId){
                    return tenants.filter(t => t._id === rbac.getAuthUser.tenantId)
                }else{
                    return tenants
                }

            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        paginateTenant: async (_, {options= {page:1, limit:5, orderBy:"", order:"asc", search:"", filters: []} as IDraxPaginateOptions }, {rbac}) => {
            try {
                rbac.assertPermission(TenantPermissions.View)
                const tenantService = TenantServiceFactory()
                return await tenantService.paginate(options)
            } catch (e) {
                console.error("paginateTenant",e)
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        }
    },
    Mutation: {
        createTenant: async (_, {input}, {rbac}) => {
            try {
                rbac.assertPermission(TenantPermissions.Create)
                const tenantService = TenantServiceFactory()
                return await tenantService.create(input)
            } catch (e) {
                console.error("createTenant",e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        },
        updateTenant: async (_, {id, input}, {rbac}) => {
            try {
                rbac.assertPermission(TenantPermissions.Update)
                const tenantService = TenantServiceFactory()
                return await tenantService.update(id, input)
            } catch (e) {
                console.error("updateTenant",e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        deleteTenant: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(TenantPermissions.Delete)
                const tenantService = TenantServiceFactory()
                return await tenantService.delete(id)
            } catch (e) {
                console.error("deleteTenant",e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        }
    }
}
