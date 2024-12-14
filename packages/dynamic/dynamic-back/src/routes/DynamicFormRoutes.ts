
import DynamicFormController from "../controllers/DynamicFormController.js";

async function DynamicFormFastifyRoutes(fastify, options) {

    const controller: DynamicFormController = new DynamicFormController()

    fastify.get('/api/dynamicform/:id', (req,rep) => controller.findById(req,rep))

    fastify.get('/api/dynamicform/ids/:ids', (req,rep) => controller.findByIds(req,rep))

    fastify.get('/api/dynamicform', (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/dynamicform/search', (req,rep) => controller.search(req,rep))

    fastify.get('/api/dynamicform/find', (req,rep) => controller.find(req,rep))

    fastify.get('/api/dynamicform/find-one', (req,rep) => controller.findOne(req,rep))

    fastify.post('/api/dynamicform', (req,rep) =>controller.create(req,rep))

    fastify.put('/api/dynamicform/:id', (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/dynamicform/:id', (req,rep) =>controller.delete(req,rep))

}

export default DynamicFormFastifyRoutes;
export {DynamicFormFastifyRoutes}
