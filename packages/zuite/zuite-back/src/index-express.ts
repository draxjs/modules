import ApolloExpressServer from './ApolloExpressServer.js';
import ModuleMerger from "./ModuleMerger.js";

const {typeDefs, resolvers} = await ModuleMerger()
const server = new ApolloExpressServer(typeDefs,resolvers);

await server.start(8081);
