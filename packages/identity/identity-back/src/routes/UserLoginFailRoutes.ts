
import UserLoginFailController from "../controllers/UserLoginFailController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {UserLoginFailSchema, UserLoginFailBaseSchema} from '../schemas/UserLoginFailSchema.js'

async function UserLoginFailRoutes(fastify, options) {

    const controller: UserLoginFailController = new UserLoginFailController()
    const schemas = new CrudSchemaBuilder(UserLoginFailSchema, UserLoginFailBaseSchema,UserLoginFailBaseSchema, 'UserLoginFail', 'openapi-3.0', ['Identity']);

    fastify.get('/api/user-login-fails', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/user-login-fails/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.get('/api/user-login-fails/export', {schema: schemas.exportSchema}, (req,rep) => controller.export(req,rep))

}

export default UserLoginFailRoutes;
export {UserLoginFailRoutes}
