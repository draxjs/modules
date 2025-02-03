import SettingController from "../controller/SettingController.js";


async function SettingsRoutes(fastify, options) {
    const controller: SettingController = new SettingController()

    fastify.get('/api/settings', (req,rep) => controller.fetchAll(req,rep))

    fastify.get('/api/settings/grouped', (req,rep) => controller.fetchGrouped(req,rep))

    fastify.get('/api/settings/:key', (req,rep) => controller.findByKey(req,rep))

    fastify.patch('/api/settings/:id', (req,rep) => controller.updateValue(req,rep))
}

export default SettingsRoutes
export {SettingsRoutes}
