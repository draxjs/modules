
import AILogController from "../controllers/AILogController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {AILogSchema, AILogBaseSchema} from '../schemas/AILogSchema.js'

async function AILogFastifyRoutes(fastify, options) {

    const controller: AILogController = new AILogController()
    const schemas = new CrudSchemaBuilder(AILogSchema, AILogBaseSchema,AILogBaseSchema, 'AILog', 'openapi-3.0', ['ai']);

    fastify.get('/api/ailog', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/ailog/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/ailog/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/ailog/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/ailog/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/ailog/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/ailog', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/ailog/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/ailog/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/ailog/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/ailog/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/ailog/import', (req,rep) => controller.import(req,rep))
    
}

export default AILogFastifyRoutes;
export {AILogFastifyRoutes}
