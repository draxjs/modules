import {jwtMiddleware, rbacMiddleware, UserRoutes, RoleRoutes} from "@drax/identity-back"
import ModuleMerger from "../utils/ModuleMerger.js";
import ApolloExpressServer from "../servers/ApolloExpressServer.js";
const {typeDefs, resolvers} = await ModuleMerger()



function ApolloExpressServerFactory() {
    const server = new ApolloExpressServer(typeDefs,resolvers);
    server.expressUse(jwtMiddleware)
    server.expressUse(rbacMiddleware)
    server.expressUse(UserRoutes)
    server.expressUse(RoleRoutes)
    return server

}


export default ApolloExpressServerFactory
