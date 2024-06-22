import YogaFastifyServer from "../servers/YogaFastifyServer.js";
import {jwtMiddleware, rbacMiddleware, UserRoutes, RoleRoutes, TenantRoutes} from "@drax/identity-back"
import ModuleMerger from "../utils/ModuleMerger.js";
const {typeDefs, resolvers} = await ModuleMerger()

function YogaFastifyServerFactory() {
    const server = new YogaFastifyServer(typeDefs, resolvers, [jwtMiddleware]);
    server.fastifyDecorateRequest('authUser',null)
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyHook('onRequest',rbacMiddleware)
    server.fastifyRegister(UserRoutes)
    server.fastifyRegister(RoleRoutes)
    server.fastifyRegister(TenantRoutes)
    return server
}

export default YogaFastifyServerFactory
