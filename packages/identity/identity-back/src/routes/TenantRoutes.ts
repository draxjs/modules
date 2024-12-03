import TenantController from '../controllers/TenantController.js'

async function TenantRoutes(fastify, options) {

    const controller: TenantController = new TenantController()

    fastify.get('/api/tenants/export', (req,rep) => controller.export(req,rep) )

    fastify.get('/api/tenants/search', (req,rep) => controller.search(req,rep) )

    fastify.get('/api/tenants/:id', (req,rep) => controller.findById(req,rep) )

    fastify.get('/api/tenants/name/:name', (req,rep) => controller.findByName(req,rep))

    fastify.get('/api/tenants/all', (req,rep) => controller.all(req,rep))

    fastify.get('/api/tenants', (req,rep) => controller.paginate(req,rep))

    fastify.post('/api/tenants', (req,rep) => controller.create(req,rep))

    fastify.put('/api/tenants/:id', (req,rep) => controller.update(req,rep))

    fastify.delete('/api/tenants/:id', (req,rep) => controller.delete(req,rep))

}

export default TenantRoutes;
export {TenantRoutes}
