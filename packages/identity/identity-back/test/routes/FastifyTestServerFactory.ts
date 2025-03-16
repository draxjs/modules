import Fastify from "fastify";
import {InternalServerError} from "@drax/common-back";


const FastifyTestServerFactory = () => {
    const fastify = Fastify()
    fastify.setErrorHandler((error, request, reply) => {
        console.error("Error",error)
        let serverError = new InternalServerError()
        reply.status(serverError.statusCode).send(serverError.body)
    },)
    fastify.setValidatorCompiler(() => () => true)
    fastify.addHook('preHandler', async (request, reply) => {
        //@ts-ignore
        request.rbac = {assertPermission: () => true,};
    });

    return fastify
}

export default FastifyTestServerFactory
export {FastifyTestServerFactory}
