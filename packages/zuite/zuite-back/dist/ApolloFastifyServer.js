import { ApolloServer } from "@apollo/server";
import Fastify from "fastify";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import ApolloErrorPlugin from "./ApolloPlugins/ApolloErrorPlugin.js";
class ApolloExpressServer {
    constructor(typeDefs, resolvers) {
        this.typeDefs = typeDefs;
        this.resolvers = resolvers;
        this.fastifyServer = Fastify();
        this.apolloServer = new ApolloServer({
            typeDefs: this.typeDefs,
            resolvers: this.resolvers,
            plugins: [fastifyApolloDrainPlugin(this.fastifyServer), ApolloErrorPlugin]
        });
        this.addMonitorEndpoint();
    }
    fastifyDecorateRequest(prop, defaultValue) {
        this.fastifyServer.decorateRequest(prop, defaultValue);
    }
    fastifyHook(hookName, hookFunction) {
        this.fastifyServer.addHook(hookName, hookFunction);
    }
    fastifyRegister(route) {
        this.fastifyServer.register(route);
    }
    async fastifyRegisterApollo() {
        await this.fastifyServer.register(fastifyApollo(this.apolloServer));
    }
    addMonitorEndpoint() {
        this.fastifyServer.get('/info', async (request, reply) => {
            return 'Running';
        });
    }
    async start(port, baseUrl = 'http://localhost') {
        await this.apolloServer.start();
        await this.fastifyRegisterApollo();
        await this.fastifyServer.listen({ port: port });
        console.log(`🚀 Server ready at ${baseUrl}:${port}`);
    }
}
export default ApolloExpressServer;
