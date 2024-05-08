import ModuleMerger from "./ModuleMerger.js";
import ApolloFastifyServer from "./ApolloFastifyServer.js";
import MongoDb from './MongoDB.js'
MongoDb()

const {typeDefs, resolvers} = await ModuleMerger()
const server = new ApolloFastifyServer(typeDefs,resolvers);

await server.start(8082);
