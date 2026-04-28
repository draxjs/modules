
import CovenantController from "../controllers/CovenantController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {CovenantSchema, CovenantBaseSchema} from '../schemas/CovenantSchema.js'

async function CovenantFastifyRoutes(fastify, options) {

    const controller: CovenantController = new CovenantController()
    const schemas = new CrudSchemaBuilder(CovenantSchema, CovenantBaseSchema,CovenantBaseSchema, 'Covenant', 'openapi-3.0', ['Covenant']);

    fastify.get('/api/covenants', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/covenants/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/covenants/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/covenants/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/covenants/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/covenants/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/covenants', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/covenants/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/covenants/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/covenants/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/covenants/export', (req,rep) =>controller.export(req,rep))

    fastify.get('/api/covenants/export-excel', (req,rep) =>controller.exportExcel(req,rep))
    
}

export default CovenantFastifyRoutes;
export {CovenantFastifyRoutes}
