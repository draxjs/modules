import UserServiceFactory from "../../factory/UserServiceFactory.js";
import {GraphQLError} from "graphql";
import {ValidationErrorToGraphQLError, ValidationError, StoreManager} from "@drax/common-back";
import {IdentityPermissions} from "../../permissions/IdentityPermissions.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";
import BadCredentialsError from "../../errors/BadCredentialsError.js";
import {join} from "path";

export default {
    Query: {
        me: async (_, {}, {authUser}) => {
            try {
                if (authUser) {
                    let userService = UserServiceFactory()
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
                let userService = UserServiceFactory()
                return await userService.findById(id)
            } catch (e) {
                if (e instanceof UnauthorizedError) {
                    throw new GraphQLError(e.message)
                }
                throw new GraphQLError('error.server')
            }

        },
        paginateUser: async (_, { options= {page:1, limit:5, orderBy:"", orderDesc:false, search:"", filters: []} }, {rbac}) => {
            try {
                rbac.assertPermission(IdentityPermissions.ViewUser)
                let userService = UserServiceFactory()
                if (rbac.getAuthUser.tenantId) {
                    options.filters.push({field: 'tenant', operator: '$eq', value: rbac.getAuthUser.tenantId})
                }
                return await userService.paginate(options)
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
                let userService = UserServiceFactory()
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
                let userService = UserServiceFactory()
                if (rbac.getAuthUser.tenantId) {
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
                let userService = UserServiceFactory()
                if (rbac.getAuthUser.tenantId) {
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
                let userService = UserServiceFactory()
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
                let userService = UserServiceFactory()
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
                let userService = UserServiceFactory()
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
        changeAvatar: async (_, {file}, {rbac, authUser}) => {
            try {
                rbac.assertAuthenticated()
                const userId = authUser.id

                const FILE_DIR = process.env.DRAX_AVATAR_DIR || 'avatars';
                const BASE_URL = process.env.DRAX_BASE_URL.replace(/\/$/, '') || ''

                //console.log("FILE:", file)

                let preFile

                //Yoga PonyfillFile
                if (file.blobParts) {
                    preFile = {
                        filename: file.name,
                        fileStream: file.blobParts,
                        mimetype: file.type,
                        encoding: file.encoding,
                    }
                }


                const destinationPath = join(FILE_DIR)
                const storedFile = await StoreManager.saveFile(preFile, destinationPath)
                const urlFile = BASE_URL + '/api/user/avatar/' + storedFile.filename

                let userService = UserServiceFactory()
                return await userService.changeAvatar(userId, urlFile)
            } catch (e) {
                console.error("changeAvatar", e)
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
