import RoleController from "../controllers/RoleController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {RoleBaseSchema, RoleSchema} from "../schemas/RoleSchema.js";
import zod from "zod";

async function RoleRoutes(fastify, options) {

    const controller: RoleController = new RoleController()
    const schemas = new CrudSchemaBuilder(RoleSchema, RoleBaseSchema, RoleBaseSchema, 'role','openapi-3.0', ['Identity']);

    fastify.get('/api/roles/search', {schema: schemas.searchSchema}, (req, rep) => controller.search(req, rep))

    fastify.get('/api/roles/:id', {schema: schemas.findByIdSchema}, (req, rep) => controller.findById(req, rep))

    fastify.get('/api/roles/all', {schema: schemas.allSchema}, (req, rep) => controller.all(req, rep))

    fastify.get('/api/roles', {schema: schemas.paginateSchema}, (req, rep) => controller.paginate(req, rep))

    fastify.post('/api/roles', {schema: schemas.createSchema}, (req, rep) => controller.create(req, rep))

    fastify.put('/api/roles/:id', {schema: schemas.updateSchema}, (req, rep) => controller.update(req, rep))

    fastify.delete('/api/roles/:id', {schema: schemas.deleteSchema}, (req, rep) => controller.delete(req, rep))

    fastify.get('/api/roles/export', {schema: schemas.exportSchema}, (req, rep) => controller.export(req, rep))

    fastify.get('/api/permissions', {
        schema: {
            tags: ['Identity'],
            response: {
                200: zod.toJSONSchema(zod.array(zod.string())),
                401: schemas.jsonErrorBodyResponse,
                403: schemas.jsonErrorBodyResponse,
            }
        }
    }, (req, rep) => controller.permissions(req, rep))

    fastify.get('/api/roles/name/:name', {
        schema: {
            tags: ['Identity'],
            params: zod.toJSONSchema(zod.object({name: zod.string()})),
            response: {
                200: schemas.jsonEntitySchema,
                401: schemas.jsonErrorBodyResponse,
                403: schemas.jsonErrorBodyResponse,
                404: schemas.jsonErrorBodyResponse,
            }
        }
    }, (req, rep) => controller.findByName(req, rep))

}

export default RoleRoutes;
export {RoleRoutes}
