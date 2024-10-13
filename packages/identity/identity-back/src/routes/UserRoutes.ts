import UserController from "../controllers/UserController.js";

async function UserRoutes(fastify, options) {

    const controller: UserController = new UserController()

    fastify.post('/api/auth', (req,rep) => controller.auth(req,rep))

    fastify.get('/api/me', (req,rep) => controller.me(req,rep))

    fastify.get('/api/users/export', (req,rep) => controller.export(req,rep) )

    fastify.get('/api/users', (req,rep) => controller.paginate(req,rep))

    fastify.post('/api/users', (req,rep) => controller.create(req,rep))

    fastify.put('/api/users/:id', (req,rep) => controller.update(req,rep))

    fastify.delete('/api/users/:id', (req,rep) => controller.delete(req,rep))

    fastify.post('/api/password', (req,rep) => controller.myPassword(req,rep))

    fastify.post('/api/password/:id', (req,rep) => controller.password(req,rep))

    fastify.post('/api/user/avatar', (req,rep) => controller.updateAvatar(req,rep))

    fastify.get('/api/user/avatar/:filename', (req,rep) => controller.getAvatar(req,rep))

}

export default UserRoutes;
export {UserRoutes}
