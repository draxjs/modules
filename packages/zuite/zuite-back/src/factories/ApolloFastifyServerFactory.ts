import {jwtMiddleware, UserRoutes, RoleRoutes, TenantRoutes, UserAvatarRoutes,UserApiKeyRoutes,  rbacMiddleware} from "@drax/identity-back"
import ModuleMerger from "../utils/ModuleMerger.js";
import ApolloFastifyServer from "../servers/ApolloFastifyServer.js";
const {typeDefs, resolvers} = await ModuleMerger()



function ApolloFastifyServerFactory(rootDir:string) {
    const server = new ApolloFastifyServer(typeDefs,resolvers, rootDir);
    server.fastifyDecorateRequest('authUser',null)
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyHook('onRequest',rbacMiddleware)
    server.fastifyRegister(UserRoutes)
    server.fastifyRegister(RoleRoutes)
    server.fastifyRegister(TenantRoutes)
    server.fastifyRegister(UserAvatarRoutes)
    server.fastifyRegister(UserApiKeyRoutes)
    return server
}


export default ApolloFastifyServerFactory
