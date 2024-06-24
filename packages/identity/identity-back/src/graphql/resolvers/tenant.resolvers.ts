import TenantServiceFactory from "../../factory/TenantServiceFactory.js";
import {IdentityPermissions} from "../../permissions/IdentityPermissions.js";
import {ValidationError, ValidationErrorToGraphQLError} from "@drax/common-back";
import {GraphQLError} from "graphql";
import {PermissionService} from "../../services/PermissionService.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";


export default {
    Query: {
        findTenantById: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewTenant)
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
                rbac.assertPermission(IdentityPermissions.ViewTenant)
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
                rbac.assertPermission(IdentityPermissions.ViewTenant)
                const tenantService = TenantServiceFactory()
                const tenants =  await tenantService.fetchAll()
                if(rbac.getAuthUser.tenantId){
                    return tenants.filter(t => t.id === rbac.getAuthUser.tenantId)
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
        paginateTenant: async (_, {page, limit, seach}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewTenant)
                const tenantService = TenantServiceFactory()
                return await tenantService.paginate(page, limit, seach)
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
                rbac.assertPermission(IdentityPermissions.CreateTenant)
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
                rbac.assertPermission(IdentityPermissions.UpdateTenant)
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
                rbac.assertPermission(IdentityPermissions.DeleteTenant)
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