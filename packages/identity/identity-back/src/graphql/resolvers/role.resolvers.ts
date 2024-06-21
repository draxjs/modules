import RoleServiceFactory from "../../factory/RoleServiceFactory.js";
import {IdentityPermissions} from "../../permissions/IdentityPermissions.js";
import {ValidationError, ValidationErrorToGraphQLError} from "@drax/common-back";
import {GraphQLError} from "graphql";
import {PermissionService} from "../../services/PermissionService.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";


export default {
    Query: {
        findRoleById: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewRole)
                const roleService = RoleServiceFactory()
                return await roleService.findById(id)
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        findRoleByName: async (_, {name}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewRole)
                const roleService = RoleServiceFactory()
                return await roleService.findByName(name)
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        fetchRole: async (_, {}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewRole)
                const roleService = RoleServiceFactory()
                return await roleService.fetchAll()
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        fetchPermissions: async (_, {}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.PermissionsRole)
                return PermissionService.getPermissions()
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        paginateRole: async (_, {page, limit, seach}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewRole)
                const roleService = RoleServiceFactory()
                return await roleService.paginate(page, limit, seach)
            } catch (e) {
                console.error("paginateRole",e)
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        }
    },
    Mutation: {
        createRole: async (_, {input}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.CreateRole)
                const roleService = RoleServiceFactory()
                return await roleService.create(input)
            } catch (e) {
                console.error("createRole",e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        },
        updateRole: async (_, {id, input}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.UpdateRole)
                const roleService = RoleServiceFactory()
                const currentRole = await roleService.findById(id)
                if(currentRole.readonly){
                    throw new ValidationError([{field:'name', reason:"role.readonly", value:input.name}])
                }

                return await roleService.update(id, input)
            } catch (e) {
                console.error("updateRole",e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        deleteRole: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.DeleteRole)
                const roleService = RoleServiceFactory()
                return await roleService.delete(id)
            } catch (e) {
                console.error("deleteRole",e)
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
