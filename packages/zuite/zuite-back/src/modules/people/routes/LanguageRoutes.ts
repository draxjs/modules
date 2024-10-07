
import LanguageController from "../controllers/LanguageController.js";

async function LanguageFastifyRoutes(fastify, options) {

    const controller: LanguageController = new LanguageController()

    fastify.get('/api/language/:id', (req,rep) => controller.findById(req,rep))

    fastify.get('/api/language/ids/:ids', (req,rep) => controller.findByIds(req,rep))

    fastify.get('/api/language', (req,rep) => controller.paginate(req,rep) )

    fastify.get('/api/language/search', (req,rep) => controller.search(req,rep) )

    fastify.get('/api/language/export', (req,rep) => controller.export(req,rep) )

    fastify.post('/api/language', (req,rep) =>controller.create(req,rep))

    fastify.put('/api/language/:id', (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/language/:id', (req,rep) =>controller.delete(req,rep))
}

export default LanguageFastifyRoutes;
export {LanguageFastifyRoutes}
