
import DashboardController from "../controllers/DashboardController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {DashboardSchema, DashboardBaseSchema} from '../schemas/DashboardSchema.js'

async function DashboardFastifyRoutes(fastify, options) {

    const controller: DashboardController = new DashboardController()
    const schemas = new CrudSchemaBuilder(DashboardSchema, DashboardBaseSchema,DashboardBaseSchema, 'Dashboard', 'openApi3', ['dashboard']);

    fastify.get('/api/dashboard', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/dashboard/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('/api/dashboard/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/dashboard/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('/api/dashboard/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/dashboard/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/dashboard', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/dashboard/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/dashboard/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
}

export default DashboardFastifyRoutes;
export {DashboardFastifyRoutes}
