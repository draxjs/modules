
import FileController from "../controllers/FileController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {FileSchema, FileBaseSchema} from '../schemas/FileSchema.js'

async function FileFastifyRoutes(fastify, options) {

    const controller: FileController = new FileController()
    const schemas = new CrudSchemaBuilder(FileSchema, FileBaseSchema,FileBaseSchema, 'File', 'openapi-3.0', ['media']);

    fastify.get('/api/file', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/file/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/file/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/file/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/file/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/file/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/file', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/file/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/file/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/file/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/file/export', (req,rep) =>controller.export(req,rep))
    
}

export default FileFastifyRoutes;
export {FileFastifyRoutes}
