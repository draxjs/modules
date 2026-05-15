
import AgentSessionController from "../controllers/AgentSessionController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {AgentSessionSchema, AgentSessionBaseSchema} from '../schemas/AgentSessionSchema.js'

async function AgentSessionFastifyRoutes(fastify, options) {

    const controller: AgentSessionController = new AgentSessionController()
    const schemas = new CrudSchemaBuilder(AgentSessionSchema, AgentSessionBaseSchema,AgentSessionBaseSchema, 'AgentSession', 'openapi-3.0', ['ai']);

    fastify.get('/api/agentsession', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/agentsession/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/agentsession/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/agentsession/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/agentsession/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/agentsession/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/agentsession', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/agentsession/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/agentsession/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/agentsession/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/agentsession/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/agentsession/import', (req,rep) => controller.import(req,rep))
    
}

export default AgentSessionFastifyRoutes;
export {AgentSessionFastifyRoutes}
