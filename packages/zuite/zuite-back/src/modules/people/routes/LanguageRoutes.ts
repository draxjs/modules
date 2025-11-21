
import LanguageController from "../controllers/LanguageController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {LanguageSchema, LanguageBaseSchema} from '../schemas/LanguageSchema.js'

async function LanguageFastifyRoutes(fastify, options) {

    const controller: LanguageController = new LanguageController()
    const schemas = new CrudSchemaBuilder(LanguageSchema, LanguageBaseSchema,LanguageBaseSchema, 'Language', 'openApi3', ['people']);

    fastify.get('/api/language', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/language/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('/api/language/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/language/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))


    fastify.get('/api/language/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('/api/language/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.post('/api/language', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/language/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/language/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

}

export default LanguageFastifyRoutes;
export {LanguageFastifyRoutes}
