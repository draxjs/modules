import Fastify from "fastify";
import {InternalServerError} from "@drax/common-back";

import {
    jwtMiddleware, rbacMiddleware, apiKeyMiddleware,
} from '../../../src/index'


const FastifyTestServerFactory = () => {
    const fastify = Fastify()
    fastify.setErrorHandler((error, request, reply) => {
        console.error("Error",error)
        let serverError = new InternalServerError()
        reply.status(serverError.statusCode).send(serverError.body)
    },)
    fastify.setValidatorCompiler(() => () => true)

    fastify.addHook('onRequest', jwtMiddleware)
    fastify.addHook('onRequest', rbacMiddleware)
    fastify.addHook('onRequest', apiKeyMiddleware)


    // fastify.addHook('preHandler', async (request, reply) => {
    //     //@ts-ignore
    //     request.rbac = {assertPermission: () => true, getAuthUser: {username: 'admin', tenantId: ''}};
    //     //@ts-ignore
    //     request.authUser = {id:USER._id, username: USER.username, tenantId: '', roleId: USER.role};
    // });

    return fastify
}

export default FastifyTestServerFactory
export {FastifyTestServerFactory}
