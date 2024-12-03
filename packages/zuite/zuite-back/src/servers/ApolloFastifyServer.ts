import {ApolloServer} from "@apollo/server";
import Fastify, {FastifyInstance, FastifyRequest} from "fastify";
import fastifyApollo, {fastifyApolloDrainPlugin, fastifyApolloHandler} from "@as-integrations/fastify";
import type {ApolloFastifyContextFunction} from "@as-integrations/fastify";
import ApolloErrorPlugin from "./ApolloPlugins/ApolloErrorPlugin.js";
import {IJwtUser} from "@drax/identity-share";
import path from "path";
import {fileURLToPath} from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

declare module 'fastify' {
    interface FastifyRequest {
        authUser?: IJwtUser;
    }
}

interface ApolloContext {
    request: FastifyRequest
}

class ApolloFastifyServer {

    fastifyServer: FastifyInstance
    apolloServer: any
    typeDefs: any
    resolvers: any
    rootDir: string;

    constructor(typeDefs: any, resolvers: any, rootDir: string) {
        this.typeDefs = typeDefs
        this.resolvers = resolvers
        this.rootDir = rootDir ? rootDir : path.join(__dirname, '..');
        this.setup()

    }

    setup() {
        this.setupFastifyServer()
        this.setupApolloServer()
        this.setupStatusRoute()
    }

    setupFastifyServer(): void {
        this.fastifyServer = Fastify()
    }

    setupApolloServer(){
        this.apolloServer = new ApolloServer<ApolloContext>({
                typeDefs: this.typeDefs,
                resolvers: this.resolvers,
                plugins: [fastifyApolloDrainPlugin(this.fastifyServer), ApolloErrorPlugin]
            }
        )
    }

    setupStatusRoute(): void {
        this.fastifyServer.get('/status', async (request, reply) => {
            return 'Running'
        })
    }

    fastifyDecorateRequest(prop: string, defaultValue: any) {
        this.fastifyServer.decorateRequest(prop, defaultValue)
    }

    fastifyHook(hookName: any, hookFunction: any) {
        this.fastifyServer.addHook(hookName, hookFunction)
    }

    fastifyRegister(route) {
        this.fastifyServer.register(route)
    }

    async linkFastifyApollo(): Promise<void> {

        const contextFunction: ApolloFastifyContextFunction<ApolloContext> = async (request) => {
            return {
                request: request,
                authUser: request.authUser,
                rbac: request.rbac
            }
        };

        this.fastifyServer.post("/graphql", fastifyApolloHandler(this.apolloServer, {
            context: contextFunction,
        }))

    }



    async start(port: number, baseUrl: string = 'http://localhost') {
        await this.apolloServer.start()
        await this.linkFastifyApollo()
        await this.fastifyServer.listen({port: port});
        console.log(`🚀 Server FastifyApollo ready at ${baseUrl}:${port}`);
    }

}

export default ApolloFastifyServer;
