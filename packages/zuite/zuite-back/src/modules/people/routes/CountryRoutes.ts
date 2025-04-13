
import CountryController from "../controllers/CountryController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {CountrySchema, CountryBaseSchema} from '../schemas/CountrySchema.js'

async function CountryFastifyRoutes(fastify, options) {

    const controller: CountryController = new CountryController()
    const schemas = new CrudSchemaBuilder(CountrySchema, CountryBaseSchema,CountryBaseSchema, 'Country', 'openApi3', ['ABM']);

    fastify.get('/api/countries', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/countries/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    fastify.get('/api/countries/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/countries/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    fastify.get('/api/countries/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.post('/api/countries', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/countries/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/countries/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
}

export default CountryFastifyRoutes;
export {CountryFastifyRoutes}
