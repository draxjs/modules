
import UserSessionController from "../controllers/UserSessionController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {UserSessionSchema, UserSessionBaseSchema} from '../schemas/UserSessionSchema.js'

async function UserSessionRoutes(fastify, options) {

    const controller: UserSessionController = new UserSessionController()
    const schemas = new CrudSchemaBuilder(UserSessionSchema, UserSessionBaseSchema,UserSessionBaseSchema, 'UserSession', 'openapi-3.0', ['Identity']);

    fastify.get('/api/user-sessions', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/user-sessions/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.get('/api/user-sessions/export', {schema: schemas.exportSchema}, (req,rep) => controller.export(req,rep))

}

export default UserSessionRoutes;
export {UserSessionRoutes}
