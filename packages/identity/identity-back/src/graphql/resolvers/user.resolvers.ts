import UserServiceFactory from "../../factory/UserServiceFactory.js";

const userService = UserServiceFactory()
export default {
    Query: {
        findUserById:  async (_,{id}) => {
            return await userService.findById(id)
        },
        paginateUser: async (_,{page, limit}) => {
            console.log("paginateUser")
            return await userService.paginate(page, limit)
        }
    },
    Mutation: {
        createUser: async (_,{input}) => {
            console.log("createUser")
            const user =  await userService.create(input)
            return user
        },
        updateUser: async (_,{id, input}) => {
            return await userService.update(id, input)
        },
        deleteUser: async (_,{id}) => {
            return await userService.delete(id)
        }
    }
}
