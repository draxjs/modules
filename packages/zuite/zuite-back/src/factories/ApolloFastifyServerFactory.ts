import {jwtMiddleware, authRoutes} from "@drax/identity-back"
import ModuleMerger from "../utils/ModuleMerger.js";
import ApolloFastifyServer from "../servers/ApolloFastifyServer.js";
const {typeDefs, resolvers} = await ModuleMerger()



function ApolloFastifyServerFactory() {
    const server = new ApolloFastifyServer(typeDefs,resolvers);
    server.fastifyDecorateRequest('authUser',null)
    server.fastifyHook('preHandler',jwtMiddleware)
    server.fastifyRegister(authRoutes)
    return server
}


export default ApolloFastifyServerFactory
