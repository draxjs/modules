import {jwtMiddleware, UserRoutes, RoleRoutes, TenantRoutes,UserApiKeyRoutes,  rbacMiddleware} from "@drax/identity-back"
import {DynamicFormRoutes} from "@drax/dynamic-back"
import ModuleMerger from "../merge/ModuleMerger.js";
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
    server.fastifyRegister(UserApiKeyRoutes)
    server.fastifyRegister(DynamicFormRoutes)
    return server
}


export default ApolloFastifyServerFactory
