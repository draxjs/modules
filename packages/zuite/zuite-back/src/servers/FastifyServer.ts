import Fastify, {FastifyInstance} from "fastify";

import {IJwtUser, IRbac} from "@drax/identity-share";
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


declare module 'fastify' {
    interface FastifyRequest {
        authUser?: IJwtUser;
        rbac?: IRbac;
    }
}


class FastifyServer {

    fastifyServer: FastifyInstance
    rootDir: string;

    constructor( rootDir: string) {
        this.rootDir = rootDir ? rootDir : path.join(__dirname);
        this.setup()
    }

    setup(){
        this.setupFastifyServer()
        this.setupMultipart()
        this.setupStatusRoute()
        this.setupWebFiles()
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
        this.fastifyServer = Fastify({ logger: true })
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
        console.log(`🚀 Server FastifyYoga ready at ${baseUrl}:${port}`);
    }

}

export default FastifyServer;
