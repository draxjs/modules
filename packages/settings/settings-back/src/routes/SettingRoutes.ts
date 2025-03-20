import SettingController from "../controller/SettingController.js";


async function SettingsRoutes(fastify, options) {
    const controller: SettingController = new SettingController()

    fastify.get('/api/settings', {
        schema: {
            tags: ['Settings'],
        }
    }, (req,rep) => controller.fetchAll(req,rep))

    fastify.get('/api/settings/grouped', {
        schema: {
            tags: ['Settings'],
        }
    }, (req,rep) => controller.fetchGrouped(req,rep))

    fastify.get('/api/settings/:key', {
        schema: {
            tags: ['Settings'],
        }
    }, (req,rep) => controller.findByKey(req,rep))

    fastify.patch('/api/settings/:id', {
        schema: {
            tags: ['Settings'],
        }
    }, (req,rep) => controller.updateValue(req,rep))
}

export default SettingsRoutes
export {SettingsRoutes}
