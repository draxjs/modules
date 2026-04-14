
import AICrudController from "../controllers/AICrudController.js";
import AIGenericController from "../controllers/AIGenericController.js";


async function AiFastifyRoutes(fastify, options) {

    const crudController: AICrudController = new AICrudController()
    const genericController: AIGenericController = new AIGenericController()

    fastify.post('/api/ai/prompt/crud', (req,rep) => crudController.prompt(req,rep))
    fastify.post('/api/ai/prompt/generic', (req,rep) => genericController.prompt(req,rep))


}

export default AiFastifyRoutes;
export {AiFastifyRoutes}
