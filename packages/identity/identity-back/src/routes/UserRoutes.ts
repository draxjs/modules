import UserController from "../controllers/UserController.js";

async function UserRoutes(fastify, options) {

    const controller: UserController = new UserController()

    fastify.post('/api/auth/login', (req,rep) => controller.auth(req,rep))

    fastify.get('/api/auth/me', (req,rep) => controller.me(req,rep))

    fastify.get('/api/users/search', (req,rep) => controller.search(req,rep) )

    fastify.get('/api/users/export', (req,rep) => controller.export(req,rep) )

    fastify.get('/api/users', (req,rep) => controller.paginate(req,rep))

    fastify.post('/api/users', (req,rep) => controller.create(req,rep))

    fastify.put('/api/users/:id', (req,rep) => controller.update(req,rep))

    fastify.delete('/api/users/:id', (req,rep) => controller.delete(req,rep))

    fastify.post('/api/users/register', (req,rep) => controller.register(req,rep))

    fastify.get('/api/users/verify-email/:code', (req,rep) => controller.verifyEmail(req,rep))

    fastify.get('/api/users/verify-phone/:code', (req,rep) => controller.verifyPhone(req,rep))

    fastify.post('/api/users/password/change', (req,rep) => controller.changeMyPassword(req,rep))

    fastify.post('/api/users/password/change/:id', (req,rep) => controller.changePassword(req,rep))

    fastify.post('/api/users/password/recovery/request', (req,rep) => controller.passwordRecoveryRequest(req,rep))

    fastify.post('/api/users/password/recovery/complete', (req,rep) => controller.recoveryPasswordComplete(req,rep))

    fastify.post('/api/users/avatar', (req,rep) => controller.updateAvatar(req,rep))

    fastify.get('/api/users/avatar/:filename', (req,rep) => controller.getAvatar(req,rep))

}

export default UserRoutes;
export {UserRoutes}
