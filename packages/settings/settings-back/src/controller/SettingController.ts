import {SettingPermissions} from "../permissions/SettingPermissions.js";
import SettingService from "../services/SettingService.js";
import SettingServiceFactory from "../factory/SettingServiceFactory.js";
import {UnauthorizedError, ValidationError} from "@drax/common-back";

class SettingController {

    protected service: SettingService
    protected permission

    constructor() {
        this.service = SettingServiceFactory()
    }

    async fetchAll(request, reply) {
        try {
            request.rbac.assertPermission(SettingPermissions.View)
            const settings = await this.service.fetchAll()
            return settings
        } catch (e) {
            console.error(e)
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async fetchGrouped(request, reply) {
        try {
            request.rbac.assertPermission(SettingPermissions.View)
            const settings = await this.service.fetchGrouped()
            return settings
        } catch (e) {
            console.error(e)
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async findByKey(request, reply) {
        try {
            request.rbac.assertPermission(SettingPermissions.View)
            const key = request.params.key
            const setting = await this.service.findByKey(key)
            return setting
        } catch (e) {
            console.error(e)
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }

    async updateValue(request, reply) {
        try {
            request.rbac.assertPermission(SettingPermissions.Update)
            const id = request.params.id
            let {value} = request.body
            const setting = await this.service.updateValue(id, value)
            return setting
        } catch (e) {
            console.error(e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }
    }
}


export default SettingController;
export {SettingController}
