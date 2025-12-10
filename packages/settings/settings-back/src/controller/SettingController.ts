import {SettingPermissions} from "../permissions/SettingPermissions.js";
import SettingService from "../services/SettingService.js";
import SettingServiceFactory from "../factory/SettingServiceFactory.js";
import {NotFoundError, UnauthorizedError, ValidationError} from "@drax/common-back";

class SettingController {

    protected service: SettingService

    constructor() {
        this.service = SettingServiceFactory()
    }

    async fetchAll(request, reply) {
        try {
            const settings = await this.service.fetchAll()

            if(!request.authUser){
                return settings.filter(s => s.public === true && !s.permission)
            }else{
                return settings.filter(s => {
                    return !s.permission || (s.permission && request.rbac.hasPermission(s.permission));
                } )
            }

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
            request.rbac.assertPermission(SettingPermissions.Manage)
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
            const key = request.params.key
            const setting = await this.service.findByKey(key)

            if(!setting){
                throw new NotFoundError()
            }

            if(setting.public === false && !request.authUser ){
                throw new UnauthorizedError()
            }

            if(setting.permission && !request.rbac.hasPermission(setting.permission)){
                throw new UnauthorizedError()
            }

            return setting
        } catch (e) {
            console.error(e)
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            }if (e instanceof NotFoundError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            }else {
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
            const updatedBy = `by ${request.authUser.username}`
            const setting = await this.service.updateValue(id, value, updatedBy)
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
