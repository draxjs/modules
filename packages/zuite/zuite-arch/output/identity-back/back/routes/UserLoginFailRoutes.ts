
import UserLoginFailController from "../controllers/UserLoginFailController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {UserLoginFailSchema, UserLoginFailBaseSchema} from '../schemas/UserLoginFailSchema.js'

async function UserLoginFailFastifyRoutes(fastify, options) {

    const controller: UserLoginFailController = new UserLoginFailController()
    const schemas = new CrudSchemaBuilder(UserLoginFailSchema, UserLoginFailBaseSchema,UserLoginFailBaseSchema, 'UserLoginFail', 'openApi3', ['Identity']);

    fastify.get('/api/user-login-fails', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/user-login-fails/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('/api/user-login-fails/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/user-login-fails/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('/api/user-login-fails/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/user-login-fails/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/user-login-fails', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/user-login-fails/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/user-login-fails/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
}

export default UserLoginFailFastifyRoutes;
export {UserLoginFailFastifyRoutes}
