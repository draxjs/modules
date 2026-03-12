import Fastify from "fastify";
 import type {FastifyInstance} from "fastify";
import {IJwtUser, IRbac} from "@drax/identity-share";
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
    BadRequestError, ForbiddenError,
    InternalServerError, InvalidIdError, LimitError, MethodNotAllowedError,
    NotFoundError, SecuritySensitiveError,
    UnauthorizedError, UploadFileError,
    ValidationError
} from "@drax/common-back";
import builderStringify from "fast-json-stringify"
import pino from 'pino'


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
        //this.debugSerialization()
        this.setupErrorHandler()
        this.setupMultipart()
        this.setupStatusRoute()
        this.setupWebFiles()
        this.setupSwagger()
    }

    logger(){
        return {
            level: 'info',
            base: undefined,
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: {
                level: (label) => {
                    return { level: label };
                },
                bindings: () => {
                    return {};
                },
                log (object) {
                    delete object.msg
                    return object
                }
            },
            serializers: {
                req: (req: any) => {
                    return {
                        method: req.method,
                        route: req.url,
                        ip: req.ip,

                    };
                },
                res: (reply: any) => {
                    return {
                        status_code: reply?.statusCode,
                        method: reply.request?.method,
                        route: reply.request?.url,
                        user: reply?.rbac?.username || null,
                        tenant: reply?.rbac?.tenantName || null,
                    };
                }
            }
        };
    }


    setupFastifyServer(): void {
        //@ts-ignore
        this.fastifyServer = Fastify({
            //@ts-ignore
            logger: this.logger(),
            ajv:{
                customOptions:{
                    allErrors: true,
                    verbose: true,
                }
            }
        })
    }

    disableValidations(){
        this.fastifyServer.setValidatorCompiler(() => () => true);
    }

    debugSerialization(){
        this.fastifyServer.setSerializerCompiler(({ schema, method, url, httpStatus, contentType }) => {
            return (data) => {
                console.log("Schema:", schema)
                console.log("Method:", method)
                console.log("URL:", url)
                console.log("HTTP Status:", httpStatus)
                console.log("Content Type:", contentType)
                console.log("Data:", data)

                //@ts-ignore
                const stringify = builderStringify(schema.response, { debug: true });
                return stringify(data)
            }
        })

    }



    setupSwagger(){
        this.fastifyServer.register(fastifySwagger as any, {
            openapi: {
                openapi: '3.0.0',
                info: {
                    title: 'Drax Swagger',
                    description: 'Drax swagger API',
                    version: '1.0.0'
                },
                // servers: [
                //     {
                //         url: 'http://localhost:3000',
                //         description: 'Development server'
                //     }
                // ],
                tags: [
                    { name: 'Auth', description: 'Auth related end-points' },
                    { name: 'Identity', description: 'Identity, User, Role, Tenant related end-points' },
                    { name: 'Media', description: 'File Media related end-points' },
                    { name: 'Settings', description: 'Settings related end-points' },

                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                        },
                        apiKeyAuth: {
                            type: 'apiKey',
                            name: 'x-api-key',
                            in: 'header'
                        }
                    }
                },
                security: [
                    { bearerAuth: [] },  // Opción 1: JWT
                    { apiKeyAuth: [] },   // Opción 2: API Key
                ],
            }
        });
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



    setupErrorHandler(){
        this.fastifyServer.setErrorHandler((e, request, reply) => {
            if(
                e instanceof ValidationError ||
                e instanceof NotFoundError ||
                e instanceof BadRequestError ||
                e instanceof UnauthorizedError ||
                e instanceof ForbiddenError ||
                e instanceof MethodNotAllowedError ||
                e instanceof InvalidIdError ||
                e instanceof SecuritySensitiveError ||
                e instanceof UploadFileError ||
                e instanceof LimitError
            ) {
                reply.status(e.statusCode).send(e.body);
            } else {
                const serverError = new InternalServerError()
                reply.statusCode = serverError.statusCode
                reply.status(500).send(serverError.body);
            }
        })
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
