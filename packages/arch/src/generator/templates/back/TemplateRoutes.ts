import {IEntitySchema} from "../../../interfaces/IEntitySchema";

function getApiBasePath(entity: IEntitySchema) {
   if (entity.apiBasePath) {
       return '/api/'+ entity.apiBasePath;
   }else{
       return '/api/'+ entity.name.toLowerCase()
   }
}

function getApiTag(entity: IEntitySchema) {
    if (entity.apiTag) {
        return entity.apiTag;
    }else{
        return entity.module
    }
}


export const TemplateRoutes = (entity: IEntitySchema) => `
import ${entity.name}Controller from "../controllers/${entity.name}Controller.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {${entity.name}Schema, ${entity.name}BaseSchema} from '../schemas/${entity.name}Schema.js'

async function ${entity.name}FastifyRoutes(fastify, options) {

    const controller: ${entity.name}Controller = new ${entity.name}Controller()
    const schemas = new CrudSchemaBuilder(${entity.name}Schema, ${entity.name}BaseSchema,${entity.name}BaseSchema, '${entity.name}', 'openApi3', ['${getApiTag(entity)}']);

    fastify.get('${getApiBasePath(entity)}', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('${getApiBasePath(entity)}/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('${getApiBasePath(entity)}/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('${getApiBasePath(entity)}/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('${getApiBasePath(entity)}/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('${getApiBasePath(entity)}/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('${getApiBasePath(entity)}', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('${getApiBasePath(entity)}/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('${getApiBasePath(entity)}/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
}

export default ${entity.name}FastifyRoutes;
export {${entity.name}FastifyRoutes}
`
