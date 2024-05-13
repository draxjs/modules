import AuthServiceFactory from "../factory/AuthServiceFactory.js";

const authService = AuthServiceFactory()
async function authRoutes (fastify, options) {
    fastify.post('/api/auth', async (request, reply) => {
        try{
            const username = request.body.username
            const password = request.body.password
            return await authService.auth(username, password)
        }catch (e) {
            if(e.message === "BadCredentials"){
                reply.code(401)
                reply.send({error: e.message})
            }
            console.log(e)
            throw e
        }
    })
}

export default authRoutes;
export {authRoutes}
