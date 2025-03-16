import Fastify from "fastify";
 import type {FastifyInstance} from "fastify";
import {IJwtUser, IRbac} from "@drax/identity-share";
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import path from 'path';
import { fileURLToPath } from 'url';
import {InternalServerError} from "@drax/common-back";
const __dirname = path.dirname(fileURLToPath(import.meta.url));


declare module 'fastify' {
    interface FastifyRequest {
        authUser?: IJwtUser;
        rbac?: IRbac;
    }
}


class FastifyServer {

    protected fastifyServer: FastifyInstance
    protected rootDir: string;

    constructor( rootDir: string) {
        this.rootDir = rootDir ? rootDir : path.join(__dirname);
        this.setupFastifyServer()
        this.disableValidations()
        this.setupErrorHandler()
        this.setupMultipart()
        this.setupStatusRoute()
        this.setupWebFiles()
        this.setupSwagger()
    }



    setupSwagger(){
        this.fastifyServer.register(fastifySwagger as any);
        this.fastifyServer.register(fastifySwaggerUi as any, { routePrefix: '/api/docs' });
    }


    setupWebFiles() {
        this.fastifyServer.register(fastifyStatic, {
            root: path.join(this.rootDir, 'web'),
            prefix: '/',
            index: 'index.html'
        });

        this.fastifyServer.setNotFoundHandler(function (request, reply) {
            reply.sendFile("index.html");
        });
    }

    setupFastifyServer(): void {
        this.fastifyServer = Fastify({
            logger: true,
        })
    }

    disableValidations(){
        this.fastifyServer.setValidatorCompiler(() => () => true);
    }

    setupErrorHandler(){
        this.fastifyServer.setErrorHandler((error, request, reply) => {
            console.error("Main Error Handler:", error)
            let serverError = new InternalServerError()
            reply.status(serverError.statusCode).send(serverError.body)
        },)
    }

    setupMultipart() {
        this.fastifyServer.register(fastifyMultipart)
        //this.fastifyServer.addContentTypeParser('multipart/form-data', {}, (req, payload, done) => done(null))
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
        await this.fastifyServer.listen({port: port, host: '0.0.0.0'});
        console.log(`🚀 Server ready at ${baseUrl}:${port}`);
    }

}

export default FastifyServer;
