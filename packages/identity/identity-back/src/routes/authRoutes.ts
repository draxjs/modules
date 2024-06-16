import UserServiceFactory from "../factory/UserServiceFactory.js";
import {IUser} from "../interfaces/IUser";

const userService = UserServiceFactory()

async function authRoutes(fastify, options) {
    fastify.post('/api/auth', async (request, reply) => {
        try {
            const username = request.body.username
            const password = request.body.password
            console.log("/api/auth username",username)
            return await userService.auth(username, password)
        } catch (e) {
            if (e.message === "BadCredentials") {
                reply.code(401)
                reply.send({error: e.message})
            }
            console.error(e)
            throw e
        }
    })

    fastify.get('/api/me', async (request, reply): Promise<IUser | null> => {
        console.log("/api/me request.authUser:", request.authUser)
        let user =  await userService.findById(request.authUser.id)
        user = user.toObject()
        delete user.password
        return user
    })

}

export default authRoutes;
export {authRoutes}
