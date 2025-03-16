import type {FastifyRequest, FastifyReply} from "fastify";
import {createSchema, createYoga} from 'graphql-yoga'
import {IJwtUser, IRbac} from "@drax/identity-share";
import path from 'path';
import {fileURLToPath} from 'url';

import FastifyServer from "./FastifyServer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


declare module 'fastify' {
    interface FastifyRequest {
        authUser?: IJwtUser;
        rbac?: IRbac;
    }
}


class YogaFastifyServer extends FastifyServer {

    protected yoga: any
    protected typeDefs: any
    protected resolvers: any

    constructor(typeDefs: any, resolvers: any, rootDir: string) {
        super(rootDir)
        this.typeDefs = typeDefs
        this.resolvers = resolvers
        this.rootDir = rootDir ? rootDir : path.join(__dirname);
        this.setupYogaServer()
        this.linkFastifyYoga()
    }


    setupYogaServer() {
        this.yoga = createYoga<{
            req: FastifyRequest
            reply: FastifyReply
        }>({
            // Integrate Fastify logger
            schema: createSchema({typeDefs: this.typeDefs, resolvers: this.resolvers}),
            logging: {
                debug: (...args) => args.forEach(arg => this.fastifyServer.log.debug(arg)),
                info: (...args) => args.forEach(arg => this.fastifyServer.log.info(arg)),
                warn: (...args) => args.forEach(arg => this.fastifyServer.log.warn(arg)),
                error: (...args) => args.forEach(arg => this.fastifyServer.log.error(arg))
            },
        })
    }

    linkFastifyYoga() {
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

}

export default YogaFastifyServer;
