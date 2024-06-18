import {jwtMiddleware, UserRoutes, RoleRoutes, rbacMiddleware} from "@drax/identity-back"
import ModuleMerger from "../utils/ModuleMerger.js";
import ApolloFastifyServer from "../servers/ApolloFastifyServer.js";
const {typeDefs, resolvers} = await ModuleMerger()



function ApolloFastifyServerFactory() {
    const server = new ApolloFastifyServer(typeDefs,resolvers);
    server.fastifyDecorateRequest('authUser',null)
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyHook('onRequest',rbacMiddleware)
    server.fastifyRegister(UserRoutes)
    server.fastifyRegister(RoleRoutes)
    return server
}


export default ApolloFastifyServerFactory
