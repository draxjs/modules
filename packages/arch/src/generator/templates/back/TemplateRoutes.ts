import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplateRoutes = (entity: IEntitySchema) => `
import ${entity.name}Controller from "../controllers/${entity.name}Controller.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {${entity.name}Schema, ${entity.name}BaseSchema} from '../schemas/${entity.name}Schema.js'

async function ${entity.name}FastifyRoutes(fastify, options) {

    const controller: ${entity.name}Controller = new ${entity.name}Controller()
    const schemas = new CrudSchemaBuilder(${entity.name}Schema, ${entity.name}BaseSchema,${entity.name}BaseSchema, '${entity.name}', 'openApi3', ['${entity.module}']);

    fastify.get('/api/${entity.name.toLowerCase()}', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/${entity.name.toLowerCase()}/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('/api/${entity.name.toLowerCase()}/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/${entity.name.toLowerCase()}/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('/api/${entity.name.toLowerCase()}/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.post('/api/${entity.name.toLowerCase()}', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/${entity.name.toLowerCase()}/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/${entity.name.toLowerCase()}/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
}

export default ${entity.name}FastifyRoutes;
export {${entity.name}FastifyRoutes}
`
