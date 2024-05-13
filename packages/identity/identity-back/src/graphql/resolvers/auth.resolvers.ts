import AuthServiceFactory from "../../factory/AuthServiceFactory.js";

const authService = AuthServiceFactory()
export default {
    Query: {

    },
    Mutation: {
        auth: async (_,{input}) => {
            try{
                return await authService.auth(input.username, input.password)
            }catch (e) {
                console.log(e)
                throw e
            }

        },

    }
}
