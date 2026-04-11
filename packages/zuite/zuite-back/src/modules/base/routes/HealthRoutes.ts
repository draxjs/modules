export const HealthRoutes = async (fastify, options) => {

    fastify.get('/api/health', async (request, reply) => {
       reply.status(200).send({ status: 'up', message: 'Server is healthy' });
    })

}
