import ModuleMerger from "./ModuleMerger.js";
import ApolloFastifyServer from "./ApolloFastifyServer.js";
import MongoDb from './MongoDB.js'
import {jwtMiddleware, authRoutes} from "@drax/identity-back"
import type {IJwtUser} from "@drax/identity-back"

MongoDb()

const {typeDefs, resolvers} = await ModuleMerger()
const server = new ApolloFastifyServer(typeDefs,resolvers);

server.fastifyDecorateRequest('authUser',null)
server.fastifyHook('preHandler',jwtMiddleware)
server.fastifyRegister(authRoutes)
await server.start(8082);
