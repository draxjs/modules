import NotificationController from "../controllers/NotificationController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {NotificationSchema, NotificationBaseSchema} from '../schemas/NotificationSchema.js'

async function NotificationFastifyRoutes(fastify, options) {

    const controller: NotificationController = new NotificationController()
    const schemas = new CrudSchemaBuilder(NotificationSchema, NotificationBaseSchema,NotificationBaseSchema, 'Notification', 'openapi-3.0', ['Notification']);

    fastify.get('/api/notifications', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/notifications/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/notifications/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/notifications/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/notifications/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/notifications/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/notifications', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/notifications/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/notifications/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/notifications/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    // Sub-recurso REST: "estado de lectura" (sin verbos)
    fastify.put(
      '/api/notifications/:id/read-state',
      {
        schema: {
          tags: ['Base'],
          summary: 'Set notification read-state to read (status=read, readAt=now)',
          params: {
            type: 'object',
            required: ['id'],
            properties: { id: { type: 'string' } }
          },
          response: {
              200: schemas.jsonEntitySchema,
              401: schemas.jsonErrorBodyResponse,
              403: schemas.jsonErrorBodyResponse,
              422: schemas.jsonValidationErrorBodyResponse,
              500: schemas.jsonErrorBodyResponse
          }
        }
      },
      (req, rep) => controller.markAsRead(req as any, rep)
    )

}

export default NotificationFastifyRoutes;
export {NotificationFastifyRoutes}
