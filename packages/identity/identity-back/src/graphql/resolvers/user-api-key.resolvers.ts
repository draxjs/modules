import UserApiKeyServiceFactory from "../../factory/UserApiKeyServiceFactory.js";
import {IdentityPermissions} from "../../permissions/IdentityPermissions.js";
import {ValidationError, ValidationErrorToGraphQLError, UnauthorizedError} from "@drax/common-back";
import {GraphQLError} from "graphql";
import * as crypto from "node:crypto";


export default {
    Query: {
        paginateUserApiKey: async (_, {options= {page:1, limit:5, orderBy:"", order:false, search:"", filters: []} }, {rbac, authUser}) => {
            try {
                rbac.assertAuthenticated()


                rbac.assertOrPermissions([
                    IdentityPermissions.ViewUserApiKey,
                    IdentityPermissions.ViewMyUserApiKey
                ])

                if(!Array.isArray(options.filters)){
                    options.filters = []
                }

                if(!rbac.hasPermission(IdentityPermissions.ViewUserApiKey)){
                    options.filters.push({field: "user", operator: "eq", value: rbac.authUser.id})
                }

                const userApiKeyService = UserApiKeyServiceFactory()
                return await userApiKeyService.paginate(options)
            } catch (e) {
                console.error("paginateUserApiKey",e)
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        }
    },
    Mutation: {
        createUserApiKey: async (_, {input}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.CreateUserApiKey)
                input.user = rbac.authUser.id
                input.secret = crypto.randomUUID()
                const userApiKeyService = UserApiKeyServiceFactory(true)
                return await userApiKeyService.create(input)
            } catch (e) {
                console.error("createUserApiKey",e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        },
        updateUserApiKey: async (_, {id, input}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.UpdateUserApiKey)
                const userApiKeyService = UserApiKeyServiceFactory()
                return await userApiKeyService.update(id, input)
            } catch (e) {
                console.error("updateUserApiKey",e)
                if (e instanceof ValidationError) {
                    throw ValidationErrorToGraphQLError(e)
                }
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }
        },
        deleteUserApiKey: async (_, {id}, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.DeleteUserApiKey)
                const userApiKeyService = UserApiKeyServiceFactory()
                return await userApiKeyService.delete(id)
            } catch (e) {
                console.error("deleteUserApiKey",e)
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
