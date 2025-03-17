import {CrudSchemaBuilder} from "@drax/crud-back";
import TenantController from '../controllers/TenantController.js'
import {TenantSchema, TenantBaseSchema, TenantByNameSchema} from '../schemas/TenantSchema.js'
import {zodToJsonSchema} from "zod-to-json-schema";
import {ErrorBodyResponseSchema} from "@drax/crud-back";


async function TenantRoutes(fastify, options) {

    const controller: TenantController = new TenantController()
    const schemas = new CrudSchemaBuilder(TenantSchema, TenantBaseSchema, 'tenant');

    //Getters
    fastify.get('/api/tenants/search', {schema: schemas.searchSchema}, (req, rep) => controller.search(req, rep))

    fastify.get('/api/tenants/:id', {schema: schemas.findByIdSchema}, (req, rep) => controller.findById(req, rep))

    fastify.get('/api/tenants/all', {schema: schemas.allSchema}, (req, rep) => controller.all(req, rep))

    fastify.get('/api/tenants/find', {schema: schemas.findSchema}, (req, rep) => controller.find(req, rep))

    fastify.get('/api/tenants/find-one', {schema: schemas.findOneSchema}, (req, rep) => controller.findOne(req, rep))

    fastify.get('/api/tenants/find-by/:field/:value', {schema: schemas.findBySchema}, (req, rep) => controller.findBy(req, rep))

    fastify.get('/api/tenants/find-one-by/:field/:value', {schema: schemas.findOneBySchema}, (req, rep) => controller.findOneBy(req, rep))

    fastify.get('/api/tenants', {schema: schemas.paginateSchema}, (req, rep) => controller.paginate(req, rep))

    //Mutations
    fastify.post('/api/tenants', {schema: schemas.createSchema}, (req, rep) => controller.create(req, rep))

    fastify.put('/api/tenants/:id', {schema: schemas.updateSchema}, (req, rep) => controller.update(req, rep))

    fastify.delete('/api/tenants/:id', {schema: schemas.deleteSchema}, (req, rep) => controller.delete(req, rep))

    //Others
    fastify.get('/api/tenants/export', (req, rep) => controller.export(req, rep))



}

export default TenantRoutes;
export {TenantRoutes}
