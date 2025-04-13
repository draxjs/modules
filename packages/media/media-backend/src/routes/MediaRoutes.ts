import MediaController from '../controllers/MediaController.js'

async function MediaRoutes(fastify, options) {

    const controller: MediaController = new MediaController()

    fastify.post('/api/file/:dir', {
        schema: {
            tags: ['Media'],
        }
    }, (req,rep) => controller.uploadFile(req,rep))


    fastify.get('/api/file/:dir/:year/:month/:filename', {
        schema: {
            tags: ['Media'],
        }
    }, (req,rep) =>  controller.downloadFile(req,rep) )


}

export default MediaRoutes;
export {MediaRoutes}
