import {jwtMiddleware, rbacMiddleware, UserRoutes, RoleRoutes, TenantRoutes} from "@drax/identity-back"
import ModuleMerger from "../merge/ModuleMerger.js";
import ApolloExpressServer from "../servers/ApolloExpressServer.js";
const {typeDefs, resolvers} = await ModuleMerger()



function ApolloExpressServerFactory(rootDir:string) {
    const server = new ApolloExpressServer(typeDefs, resolvers, rootDir);
    server.expressUse(jwtMiddleware)
    server.expressUse(rbacMiddleware)
    server.expressUse(UserRoutes)
    server.expressUse(RoleRoutes)
    server.expressUse(TenantRoutes)
    return server

}


export default ApolloExpressServerFactory
