
import CountryController from "../controllers/CountryController.js";

async function CountryFastifyRoutes(fastify, options) {

    const controller: CountryController = new CountryController()

    fastify.get('/api/country/:id', (req,rep) => controller.findById(req,rep))

    fastify.get('/api/country/ids/:ids', (req,rep) => controller.findByIds(req,rep))

    fastify.get('/api/country', (req,rep) => controller.paginate(req,rep) )

    fastify.get('/api/country/search', (req,rep) => controller.search(req,rep) )

    fastify.get('/api/country/export', (req,rep) => controller.export(req,rep) )

    fastify.post('/api/country', (req,rep) =>controller.create(req,rep))

    fastify.put('/api/country/:id', (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/country/:id', (req,rep) =>controller.delete(req,rep))
}

export default CountryFastifyRoutes;
export {CountryFastifyRoutes}
