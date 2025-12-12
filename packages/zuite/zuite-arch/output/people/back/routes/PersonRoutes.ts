
import PersonController from "../controllers/PersonController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {PersonSchema, PersonBaseSchema} from '../schemas/PersonSchema.js'

async function PersonFastifyRoutes(fastify, options) {

    const controller: PersonController = new PersonController()
    const schemas = new CrudSchemaBuilder(PersonSchema, PersonBaseSchema,PersonBaseSchema, 'Person', 'openApi3', ['people']);

    fastify.get('/api/person', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/person/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('/api/person/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/person/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('/api/person/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/person/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/person', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/person/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/person/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
}

export default PersonFastifyRoutes;
export {PersonFastifyRoutes}
