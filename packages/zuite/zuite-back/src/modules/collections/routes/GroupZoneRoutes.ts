
import GroupZoneController from "../controllers/GroupZoneController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {GroupZoneSchema, GroupZoneBaseSchema} from '../schemas/GroupZoneSchema.js'

async function GroupZoneFastifyRoutes(fastify, options) {

    const controller: GroupZoneController = new GroupZoneController()
    const schemas = new CrudSchemaBuilder(GroupZoneSchema, GroupZoneBaseSchema,GroupZoneBaseSchema, 'GroupZone', 'openapi-3.0', ['GroupZone']);

    fastify.get('/api/group-zones', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/group-zones/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/group-zones/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/group-zones/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/group-zones/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/group-zones/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/group-zones', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/group-zones/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/group-zones/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/group-zones/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/group-zones/export', (req,rep) =>controller.export(req,rep))
    
}

export default GroupZoneFastifyRoutes;
export {GroupZoneFastifyRoutes}
