import UserServiceFactory from "../../factory/UserServiceFactory.js";
import {GraphQLError} from "graphql";
import {ValidationErrorToGraphQLError, ValidationError} from "@drax/common-back";
import {IdentityPermissions} from "../../permissions/IdentityPermissions.js";
import {Rbac} from "../../rbac/Rbac.js";

const userService = UserServiceFactory()

export default {
    Query: {
        me: async (_,{},{authUser}) => {
            try{
                if(authUser){
                    let user= await userService.findById(authUser.id)
                    delete user.password
                    return user
                }
                return null
            }catch (e) {
                console.log(e)
                throw new GraphQLError(e.message)
            }

        },
        findUserById:  async (_,{id}) => {
            return await userService.findById(id)
        },
        paginateUser: async (_,{page, limit}) => {
            return await userService.paginate(page, limit)
        }
    },
    Mutation: {
        auth: async (_,{input}) => {
            try{
                return await userService.auth(input.username, input.password)
            }catch (e) {
                console.log(e)
                throw new GraphQLError(e.message)
            }

        },
        createUser: async (_,{input}) => {
            try{
                const user =  await userService.create(input)
                return user
            }catch (e){
                if(e instanceof ValidationError){
                    throw ValidationErrorToGraphQLError(e)
                }
                throw new GraphQLError(e.message)
            }

        },
        updateUser: async (_,{id, input},{rbac}) => {
            try{
                rbac.assertPermission(IdentityPermissions.EditUser)

                const user = await userService.update(id, input)
                return user
            }catch (e){
                if(e instanceof ValidationError){
                    throw ValidationErrorToGraphQLError(e)
                }
                throw new GraphQLError(e.message)
            }
        },
        deleteUser: async (_,{id}) => {
            return await userService.delete(id)
        },

    }
}
