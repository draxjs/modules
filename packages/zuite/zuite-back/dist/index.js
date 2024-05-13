import ModuleMerger from "./ModuleMerger.js";
import ApolloFastifyServer from "./ApolloFastifyServer.js";
import MongoDb from './MongoDB.js';
import { authRoutes } from "@drax/identity-back";
MongoDb();
const { typeDefs, resolvers } = await ModuleMerger();
const server = new ApolloFastifyServer(typeDefs, resolvers);
server.fastifyRegister(authRoutes);
await server.start(8082);
