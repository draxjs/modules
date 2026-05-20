import TTSGenericController from "../controllers/TTSGenericController.js";

async function TTSFastifyRoutes(fastify, options) {

    const genericController: TTSGenericController = new TTSGenericController()

    fastify.get('/api/tts/providers', (req,rep) => genericController.availableProviders(req,rep))
    fastify.post('/api/tts', (req,rep) => genericController.textToSpeech(req,rep))

}

export default TTSFastifyRoutes;
export {TTSFastifyRoutes}
