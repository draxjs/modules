
import UserSessionController from "../controllers/UserSessionController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {UserSessionSchema, UserSessionBaseSchema} from '../schemas/UserSessionSchema.js'

async function UserSessionFastifyRoutes(fastify, options) {

    const controller: UserSessionController = new UserSessionController()
    const schemas = new CrudSchemaBuilder(UserSessionSchema, UserSessionBaseSchema,UserSessionBaseSchema, 'UserSession', 'openApi3', ['Identity']);

    fastify.get('/api/user-sessions', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/user-sessions/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('/api/user-sessions/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/user-sessions/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('/api/user-sessions/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/user-sessions/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/user-sessions', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/user-sessions/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/user-sessions/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
}

export default UserSessionFastifyRoutes;
export {UserSessionFastifyRoutes}
