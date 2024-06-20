import UserServiceFactory from "../../factory/UserServiceFactory.js";
import {GraphQLError} from "graphql";
import {ValidationErrorToGraphQLError, ValidationError} from "@drax/common-back";
import {IdentityPermissions} from "../../permissions/IdentityPermissions.js";
import {Rbac} from "../../rbac/Rbac.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";
import BadCredentialsError from "../../errors/BadCredentialsError.js";

const userService = UserServiceFactory()

export default {
    Query: {
        me: async (_, {}, {authUser}) => {
            try {
                if (authUser) {
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
            rbac.assertPermission(IdentityPermissions.ViewUser)
            return await userService.findById(id)
        },
        paginateUser: async (_, {page, limit}, {rbac}) => {
            rbac.assertPermission(IdentityPermissions.ViewUser)
            return await userService.paginate(page, limit)
        }
    },
    Mutation: {
        auth: async (_, {input}) => {
            try {
                return await userService.auth(input.username, input.password)
            } catch (e) {
                if (e instanceof BadCredentialsError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        },
        createUser: async (_, {input}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.CreateUser)
                const user = await userService.create(input)
                return user
            } catch (e) {
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                throw new GraphQLError('error.server')
            }

        },
        updateUser: async (_, {id, input}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.EditUser)

                const user = await userService.update(id, input)
                return user
            } catch (e) {
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                throw new GraphQLError('error.server')
            }
        },
        deleteUser: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.DeleteUser)
                return await userService.delete(id)
            } catch (e) {
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                throw new GraphQLError('error.server')
            }
        },

    }
}
