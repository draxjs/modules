import {ApolloServer} from "@apollo/server";
import Fastify, {FastifyInstance} from "fastify";
import fastifyApollo, {fastifyApolloDrainPlugin} from "@as-integrations/fastify";
import ApolloErrorPlugin from "./ApolloPlugins/ApolloErrorPlugin.js";

interface ApolloContext {
    request: Request
}

class ApolloExpressServer {

    fastifyServer: FastifyInstance
    apolloServer: any
    typeDefs: any
    resolvers: any

    constructor(typeDefs: any, resolvers: any) {
        this.typeDefs = typeDefs
        this.resolvers = resolvers
        this.fastifyServer = Fastify()
        this.apolloServer = new ApolloServer<ApolloContext>({
                typeDefs: this.typeDefs,
                resolvers: this.resolvers,
                plugins: [fastifyApolloDrainPlugin(this.fastifyServer), ApolloErrorPlugin]
            },
        )

        this.addMonitorEndpoint()
    }

    fastifyDecorateRequest(prop : string, defaultValue : any){
        this.fastifyServer.decorateRequest(prop,defaultValue)
    }
    fastifyHook(hookName,hookFunction){
        this.fastifyServer.addHook(hookName,hookFunction)
    }
    fastifyRegister(route){
        this.fastifyServer.register(route)
    }

    async fastifyRegisterApollo(): Promise<void> {
        await this.fastifyServer.register(fastifyApollo(this.apolloServer))
    }

    addMonitorEndpoint(): void {
        this.fastifyServer.get('/info', async (request, reply) => {
            return 'Running'
        })
    }

    async start(port: number, baseUrl: string = 'http://localhost') {

        await this.apolloServer.start()
        await this.fastifyRegisterApollo()
        await this.fastifyServer.listen({port: port});
        console.log(`🚀 Server ready at ${baseUrl}:${port}`);
    }

}

export default ApolloExpressServer;
