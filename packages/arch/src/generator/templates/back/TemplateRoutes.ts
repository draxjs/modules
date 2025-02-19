export const TemplateRoutes = (entity: IEntitySchema) => `
import ${entity.name}Controller from "../controllers/${entity.name}Controller.js";

async function ${entity.name}FastifyRoutes(fastify, options) {

    const controller: ${entity.name}Controller = new ${entity.name}Controller()

    fastify.get('/api/${entity.name.toLowerCase()}/:id', (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/${entity.name.toLowerCase()}/ids/:ids', (req,rep) => controller.findByIds(req,rep))

    fastify.get('/api/${entity.name.toLowerCase()}', (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/${entity.name.toLowerCase()}/search', (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/${entity.name.toLowerCase()}/find', (req,rep) => controller.find(req,rep))
      
    fastify.get('/api/${entity.name.toLowerCase()}/find-one', (req,rep) => controller.findOne(req,rep))

    fastify.post('/api/${entity.name.toLowerCase()}', (req,rep) =>controller.create(req,rep))

    fastify.put('/api/${entity.name.toLowerCase()}/:id', (req,rep) =>controller.update(req,rep))

    fastify.delete('/api/${entity.name.toLowerCase()}/:id', (req,rep) =>controller.delete(req,rep))
    
}

export default ${entity.name}FastifyRoutes;
export {${entity.name}FastifyRoutes}
`

import {IEntitySchema} from "../../../interfaces/IEntitySchema";
