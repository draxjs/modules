import YogaFastifyServer from "../servers/YogaFastifyServer.js";
import {jwtMiddleware, rbacMiddleware, UserRoutes, RoleRoutes, TenantRoutes, UserAvatarRoutes} from "@drax/identity-back"
import {MediaRoutes} from "@drax/media-back"
import ModuleMerger from "../utils/ModuleMerger.js";
const {typeDefs, resolvers} = await ModuleMerger()

function YogaFastifyServerFactory(rootDir:string) {
    const server = new YogaFastifyServer(typeDefs, resolvers, rootDir);
    server.fastifyDecorateRequest('authUser',null)
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyHook('onRequest',rbacMiddleware)
    server.fastifyRegister(MediaRoutes)
    server.fastifyRegister(UserRoutes)
    server.fastifyRegister(RoleRoutes)
    server.fastifyRegister(TenantRoutes)
    server.fastifyRegister(UserAvatarRoutes)
    return server
}

export default YogaFastifyServerFactory
