import TTSVoiceController from "../controllers/TTSVoiceController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TTSVoiceSchema, TTSVoiceBaseSchema} from '../schemas/TTSVoiceSchema.js'

async function TTSVoiceRoutes(fastify, options) {

    const controller: TTSVoiceController = new TTSVoiceController()
    const schemas = new CrudSchemaBuilder(TTSVoiceSchema, TTSVoiceBaseSchema, TTSVoiceBaseSchema, 'TTSVoice', 'openapi-3.0', ['ai']);

    fastify.get('/api/ttsvoice', {schema: schemas.paginateSchema}, (req, rep) => controller.paginate(req, rep))
    fastify.get('/api/ttsvoice/find', {schema: schemas.findSchema}, (req, rep) => controller.find(req, rep))
    fastify.get('/api/ttsvoice/search', {schema: schemas.searchSchema}, (req, rep) => controller.search(req, rep))
    fastify.get('/api/ttsvoice/:id', {schema: schemas.findByIdSchema}, (req, rep) => controller.findById(req, rep))
    fastify.get('/api/ttsvoice/find-one', {schema: schemas.findOneSchema}, (req, rep) => controller.findOne(req, rep))
    fastify.get('/api/ttsvoice/group-by', {schema: schemas.groupBySchema}, (req, rep) => controller.groupBy(req, rep))
    fastify.post('/api/ttsvoice', {schema: schemas.createSchema}, (req, rep) => controller.create(req, rep))
    fastify.put('/api/ttsvoice/:id', {schema: schemas.updateSchema}, (req, rep) => controller.update(req, rep))
    fastify.patch('/api/ttsvoice/:id', {schema: schemas.updateSchema}, (req, rep) => controller.updatePartial(req, rep))
    fastify.delete('/api/ttsvoice/:id', {schema: schemas.deleteSchema}, (req, rep) => controller.delete(req, rep))
    fastify.get('/api/ttsvoice/export', (req, rep) => controller.export(req, rep))
    fastify.post('/api/ttsvoice/import', (req, rep) => controller.import(req, rep))

}

export default TTSVoiceRoutes;
export {TTSVoiceRoutes}
