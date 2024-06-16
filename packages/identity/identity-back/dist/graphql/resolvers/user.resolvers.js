import UserServiceFactory from "../../factory/UserServiceFactory.js";
import { GraphQLError } from "graphql";
const userService = UserServiceFactory();
export default {
    Query: {
        me: async (_, {}, context) => {
            try {
                console.log("me authUser", context.authUser);
                if (context.authUser) {
                    return await userService.findById(context.authUser.id);
                }
                return null;
            }
            catch (e) {
                console.log(e);
                throw new GraphQLError(e.message);
            }
        },
        findUserById: async (_, { id }) => {
            return await userService.findById(id);
        },
        paginateUser: async (_, { page, limit }) => {
            console.log("paginateUser");
            return await userService.paginate(page, limit);
        }
    },
    Mutation: {
        auth: async (_, { input }) => {
            try {
                return await userService.auth(input.username, input.password);
            }
            catch (e) {
                console.log(e);
                throw new GraphQLError(e.message);
            }
        },
        createUser: async (_, { input }) => {
            console.log("createUser");
            const user = await userService.create(input);
            return user;
        },
        updateUser: async (_, { id, input }) => {
            return await userService.update(id, input);
        },
        deleteUser: async (_, { id }) => {
            return await userService.delete(id);
        },
    }
};
