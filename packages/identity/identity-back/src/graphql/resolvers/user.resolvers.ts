import UserServiceFactory from "../../factory/UserServiceFactory.js";
import {GraphQLError} from "graphql";
import {TransformValidationGraphqlError, ValidationError} from "@drax/common-back";

const userService = UserServiceFactory()

export default {
    Query: {
        me: async (_,{},context) => {
            try{
                console.log("me authUser",context.authUser)
                if(context.authUser){
                    return await userService.findById(context.authUser.id)
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
            console.log("createUser")
            try{
                const user =  await userService.create(input)
                return user
            }catch (e){
                if(e instanceof ValidationError){
                    throw new GraphQLError('BAD_USER_INPUT', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            inputErrors: e.errors
                        },
                    });
                }
            }

        },
        updateUser: async (_,{id, input}) => {
            return await userService.update(id, input)
        },
        deleteUser: async (_,{id}) => {
            return await userService.delete(id)
        },

    }
}
