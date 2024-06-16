import YogaFastifyServer from "../servers/YogaFastifyServer.js";
import {jwtMiddleware, authRoutes} from "@drax/identity-back"
import ModuleMerger from "../utils/ModuleMerger.js";
const {typeDefs, resolvers} = await ModuleMerger()

function YogaFastifyServerFactory() {
    const server = new YogaFastifyServer(typeDefs, resolvers, [jwtMiddleware]);
    server.fastifyDecorateRequest('authUser',null)
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyRegister(authRoutes)
    return server
}

export default YogaFastifyServerFactory
