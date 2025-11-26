import UserApiKeyServiceFactory from "../../factory/UserApiKeyServiceFactory.js";
import {UserApiKeyPermissions} from "../../permissions/UserApiKeyPermissions.js";
import {ValidationError, ValidationErrorToGraphQLError, UnauthorizedError} from "@drax/common-back";
import {GraphQLError} from "graphql";
import * as crypto from "node:crypto";
import {IDraxPaginateOptions} from "@drax/crud-share";


export default {
    Query: {
        paginateUserApiKey: async (_, {options= {page:1, limit:5, orderBy:"", order:"asc", search:"", filters: []} as IDraxPaginateOptions }, {rbac, authUser}) => {
            try {
                rbac.assertAuthenticated()


                rbac.assertOrPermissions([
                    UserApiKeyPermissions.View,
                    UserApiKeyPermissions.ViewMy
                ])

                if(!Array.isArray(options.filters)){
                    options.filters = []
                }

                if(!rbac.hasPermission(UserApiKeyPermissions.View)){
                    options.filters.push({field: "user", operator: "eq", value: rbac.userId})
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
                rbac.assertPermission(UserApiKeyPermissions.Create)
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
                rbac.assertPermission(UserApiKeyPermissions.Update)
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
                rbac.assertPermission(UserApiKeyPermissions.Delete)
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
