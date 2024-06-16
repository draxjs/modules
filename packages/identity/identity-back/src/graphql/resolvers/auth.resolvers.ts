import { GraphQLError } from 'graphql'
import AuthServiceFactory from "../../factory/AuthServiceFactory.js";
import UserServiceFactory from "../../factory/UserServiceFactory.js";

const authService = AuthServiceFactory()
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
    },
    Mutation: {
        auth: async (_,{input}) => {
            try{
                return await authService.auth(input.username, input.password)
            }catch (e) {
                console.log(e)
                throw new GraphQLError(e.message)
            }

        },

    }
}
