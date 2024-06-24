import Fastify, {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {createSchema, createYoga} from 'graphql-yoga'
import {IJwtUser, Rbac} from "@drax/identity-back";
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


declare module 'fastify' {
    interface FastifyRequest {
        authUser?: IJwtUser;
        rbac?: Rbac;
    }
}


class YogaFastifyServer {

    fastifyServer: FastifyInstance
    yoga: any
    typeDefs: any
    resolvers: any

    constructor(typeDefs: any, resolvers: any, middlewares: any[]) {
        this.typeDefs = typeDefs
        this.resolvers = resolvers
        this.setup()
    }

    setup(){
        this.setupFastifyServer()
        this.setupMultipart()
        this.setupStatusRoute()
        this.setupYogaServer()
        this.linkFastifyYoga()
        this.setupPublicFiles()
    }

    setupPublicFiles() {
        this.fastifyServer.register(fastifyStatic, {
            root: path.join(__dirname, '..', 'public'),
            prefix: '/',
            index: 'index.html'
        });

        this.fastifyServer.setNotFoundHandler(function (request, reply) {
            reply.sendFile("index.html");
        });
    }

    setupFastifyServer(): void {
        this.fastifyServer = Fastify({ logger: true })
    }

    setupYogaServer(){
        this.yoga = createYoga<{
            req: FastifyRequest
            reply: FastifyReply
        }>({
            // Integrate Fastify logger
            schema: createSchema({typeDefs:  this.typeDefs, resolvers: this.resolvers}),
            logging: {
                debug: (...args) => args.forEach(arg => this.fastifyServer.log.debug(arg)),
                info: (...args) => args.forEach(arg => this.fastifyServer.log.info(arg)),
                warn: (...args) => args.forEach(arg => this.fastifyServer.log.warn(arg)),
                error: (...args) => args.forEach(arg => this.fastifyServer.log.error(arg))
            },
        })
    }

    linkFastifyYoga(){
        this.fastifyServer.route({
            url: this.yoga.graphqlEndpoint,
            method: ['GET', 'POST', 'OPTIONS'],
            handler: async (req, reply) => {
                // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
                const response = await this.yoga.handleNodeRequestAndResponse(req, reply, {
                    authUser: req.authUser,
                    rbac: req.rbac,
                    //req,
                    //reply
                })
                response.headers.forEach((value, key) => {
                    reply.header(key, value)
                })

                reply.status(response.status)

                reply.send(response.body)

                return reply
            }
        })
    }

    setupMultipart() {
        this.fastifyServer.addContentTypeParser('multipart/form-data', {}, (req, payload, done) => done(null))
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

    setupStatusRoute(): void {
        this.fastifyServer.get('/status', async (request, reply) => {
            return 'Running'
        })
    }

    async start(port: number, baseUrl: string = 'http://localhost') {
        await this.fastifyServer.listen({port: port});
        console.log(`🚀 Server FastifyYoga ready at ${baseUrl}:${port}`);
    }

}

export default YogaFastifyServer;
