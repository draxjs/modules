import UserApiKeyController from "../controllers/UserApiKeyController.js";


async function UserApiKeyRoutes(fastify, options) {

    const controller: UserApiKeyController = new UserApiKeyController()

    fastify.get('/api/user-api-keys', {
        schema: {
            tags: ['Identity'],
        }
    }, (req,rep) => controller.paginate(req,rep) )

    fastify.post('/api/user-api-keys', {
        schema: {
            tags: ['Identity'],
        }
    }, (req,rep) => controller.create(req,rep))

    fastify.put('/api/user-api-keys/:id', {
        schema: {
            tags: ['Identity'],
        }
    }, (req,rep) => controller.update(req,rep))

    fastify.delete('/api/user-api-keys/:id', {
        schema: {
            tags: ['Identity'],
        }
    }, (req,rep) => controller.delete(req,rep))


}

export default UserApiKeyRoutes;
export {UserApiKeyRoutes}
