import RoleController from "../controllers/RoleController.js";



async function RoleRoutes(fastify, options) {

    const controller: RoleController = new RoleController()

    fastify.get('/api/permissions', (req,rep) => controller.permissions(req,rep))

    fastify.get('/api/roles/search', (req,rep) => controller.search(req,rep))

    fastify.get('/api/roles/:id', (req,rep) => controller.findById(req,rep))

    fastify.get('/api/roles/name/:name', (req,rep) => controller.findByName(req,rep))

    fastify.get('/api/roles/all', (req,rep) => controller.all(req,rep))

    fastify.get('/api/roles', (req,rep) => controller.paginate(req,rep))

    fastify.post('/api/roles', (req,rep) => controller.create(req,rep))

    fastify.put('/api/roles/:id', (req,rep) => controller.update(req,rep))

    fastify.delete('/api/roles/:id', (req,rep) => controller.delete(req,rep))

}

export default RoleRoutes;
export {RoleRoutes}
