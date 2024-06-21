import RoleServiceFactory from "../../factory/RoleServiceFactory.js";
import {IdentityPermissions} from "../../permissions/IdentityPermissions.js";
import {ValidationError, ValidationErrorToGraphQLError} from "@drax/common-back";
import {GraphQLError} from "graphql";
import {PermissionService} from "../../services/PermissionService.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";

const roleService = RoleServiceFactory
export default {
    Query: {
        findRoleById: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewRole)
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
