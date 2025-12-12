
import AuditController from "../controllers/AuditController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {AuditSchema, AuditBaseSchema} from '../schemas/AuditSchema.js'

async function AuditFastifyRoutes(fastify, options) {

    const controller: AuditController = new AuditController()
    const schemas = new CrudSchemaBuilder(AuditSchema, AuditBaseSchema,AuditBaseSchema, 'Audit', 'openApi3', ['Audit']);

    fastify.get('/api/audits', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/audits/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('/api/audits/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/audits/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('/api/audits/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/audits/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/audits', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/audits/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/audits/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
}

export default AuditFastifyRoutes;
export {AuditFastifyRoutes}
