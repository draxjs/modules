import UserServiceFactory from "../../factory/UserServiceFactory.js";
import {GraphQLError} from "graphql";
import {ValidationErrorToGraphQLError, ValidationError} from "@drax/common-back";
import {IdentityPermissions} from "../../permissions/IdentityPermissions.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";
import BadCredentialsError from "../../errors/BadCredentialsError.js";

export default {
    Query: {
        me: async (_, {}, {authUser}) => {
            try {
                if (authUser) {
                    let userService= UserServiceFactory()
                    let user = await userService.findById(authUser.id)
                    delete user.password
                    return user
                }
                throw new UnauthorizedError()
            } catch (e) {
                console.log(e)
                throw new GraphQLError(e.message)
            }

        },
        findUserById: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewUser)
                let userService= UserServiceFactory()
                return await userService.findById(id)
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        },
        paginateUser: async (_, {page, limit, search, filters = []}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewUser)
                let userService= UserServiceFactory()
                if(rbac.getAuthUser.tenantId){
                    filters.push({field: 'tenant', operator: '$eq', value: rbac.getAuthUser.tenantId})
                }
                return await userService.paginate(page, limit, search, filters)
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        }
    },
    Mutation: {
        auth: async (_, {input}) => {
            try {
                let userService= UserServiceFactory()
                return await userService.auth(input.username, input.password)
            } catch (e) {
                console.error("auth", e)
                if (e instanceof BadCredentialsError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        },
        createUser: async (_, {input}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.CreateUser)
                let userService= UserServiceFactory()
                if(rbac.getAuthUser.tenantId){
                    input.tenant = rbac.getAuthUser.tenantId
                }
                const user = await userService.create(input)
                return user
            } catch (e) {
                console.error("createUser", e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                } else if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        },
        updateUser: async (_, {id, input}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.UpdateUser)
                let userService= UserServiceFactory()
                if(rbac.getAuthUser.tenantId){
                    input.tenant = rbac.getAuthUser.tenantId
                }
                const user = await userService.update(id, input)
                return user
            } catch (e) {
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                } else if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        deleteUser: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.DeleteUser)
                let userService= UserServiceFactory()
                return await userService.delete(id)
            } catch (e) {
                console.error("deleteUser", e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                } else if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        changeOwnPassword: async (_, {currentPassword, newPassword}, {authUser}) => {
            try {
                if (!authUser) {
                    throw new UnauthorizedError()
                }
                let userId = authUser.id
                let userService= UserServiceFactory()
                return await userService.changeOwnPassword(userId, currentPassword, newPassword)
            } catch (e) {
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                } else if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        changeUserPassword: async (_, {userId, newPassword}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.UpdateUser)
                let userService= UserServiceFactory()
                return await userService.changeUserPassword(userId, newPassword)
            } catch (e) {
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                } else if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },

    }
}
