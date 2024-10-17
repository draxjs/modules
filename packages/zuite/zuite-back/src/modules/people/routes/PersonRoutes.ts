
import PersonController from "../controllers/PersonController.js";

async function PersonFastifyRoutes(fastify, options) {

    const controller: PersonController = new PersonController()

    fastify.get('/api/person/:id', (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/person/ids/:ids', (req,rep) => controller.findByIds(req,rep))

    fastify.get('/api/person', (req,rep) => controller.paginate(req,rep) )

    fastify.get('/api/person/search', (req,rep) => controller.search(req,rep) )

    fastify.post('/api/person', (req,rep) =>controller.create(req,rep))

    fastify.put('/api/person/:id', (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/person/:id', (req,rep) =>controller.delete(req,rep))
}

export default PersonFastifyRoutes;
export {PersonFastifyRoutes}
