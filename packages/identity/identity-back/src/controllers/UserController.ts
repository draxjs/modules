import type {IUser, IUserUpdate, IUserCreate} from "@drax/identity-share";
import {AbstractFastifyController} from "@drax/crud-back";
import {CommonConfig, DraxConfig, StoreManager, UploadFileError, ValidationError, UnauthorizedError} from "@drax/common-back";

import UserServiceFactory from "../factory/UserServiceFactory.js";
import RoleServiceFactory from "../factory/RoleServiceFactory.js";
import UserService from "../services/UserService.js";
import UserPermissions from "../permissions/UserPermissions.js";
import BadCredentialsError from "../errors/BadCredentialsError.js";
import {join} from "path";
import {IdentityConfig} from "../config/IdentityConfig.js";

const BASE_FILE_DIR = DraxConfig.getOrLoad(CommonConfig.FileDir) || 'files';
const AVATAR_DIR = DraxConfig.getOrLoad(IdentityConfig.AvatarDir) || 'avatar';
const BASE_URL = DraxConfig.getOrLoad(CommonConfig.BaseUrl) ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, '') : ''


class UserController extends AbstractFastifyController<IUser, IUserCreate, IUserUpdate>   {

    protected service: UserService

    constructor() {
        super(UserServiceFactory(), UserPermissions)
    }

    async auth(request, reply) {
        try {
            const username = request.body.username
            const password = request.body.password
            const userService = UserServiceFactory()
            return await userService.auth(username, password)
        } catch (e) {
            console.error('/api/auth error', e)
            if (e instanceof BadCredentialsError) {
                reply.code(401)
                reply.send({error: e.message})
            }
            reply.code(500)
            reply.send({error: 'error.server'})
        }
    }

    async me(request, reply) {
        try {
            if (request.authUser) {
                const userService = UserServiceFactory()
                let user = await userService.findById(request.authUser.id)
                user.password = undefined
                delete user.password
                return user
            } else {
                throw new UnauthorizedError()

            }
        } catch (e) {
            if (e instanceof UnauthorizedError) {
                reply.code(401)
                reply.send({error: "Unauthorized"})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }
    }

    async paginate(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.View)
            const page = request.query.page
            const limit = request.query.limit
            const orderBy = request.query.orderBy
            const order = request.query.order
            const search = request.query.search
            const userService = UserServiceFactory()
            const filters = []
            if(request.rbac.getAuthUser.tenantId){
                filters.push({field: 'tenant', operator: 'eq', value: request.rbac.getAuthUser.tenantId})
            }
            let paginateResult = await userService.paginate({page, limit, orderBy, order, search, filters})
            for(let item of paginateResult.items){
                item.password = undefined
                delete item.password
            }
            return paginateResult
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }
    }


    async search(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.View)
            const filters = []
            if(request.rbac.getAuthUser.tenantId){
                filters.push({field: 'tenant', operator: 'eq', value: request.rbac.getAuthUser.tenantId})
            }
            const search = request.query.search
            let item = await this.service.search(search,1000,filters)
            return item
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

    async create(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.Create)
            const payload = request.body

            const roleService = RoleServiceFactory()
            const role = await roleService.findById(payload.role)
            if(!role){
                throw new ValidationError([{field: 'role', reason: 'Role not found'}])
            }else if(role.name === 'Admin'){
                payload.tenant = null
            }else if(request.rbac.getAuthUser.tenantId){
                payload.tenant = request.rbac.getAuthUser.tenantId
            }

            payload.origin ??= 'Admin'

            const userService = UserServiceFactory()
            let user = await userService.create(payload)
            return user
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }
    }

    async update(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.Update)
            const id = request.params.id
            const payload = request.body


            const roleService = RoleServiceFactory()
            const role = await roleService.findById(payload.role)
            if(!role){
                throw new ValidationError([{field: 'role', reason: 'Role not found'}])
            }else if(role.name === 'Admin'){
                payload.tenant = null
            }else if(request.rbac.getAuthUser.tenantId){
                payload.tenant = request.rbac.getAuthUser.tenantId
            }

            const userService = UserServiceFactory()
            let user = await userService.update(id, payload)
            return user
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            }
            if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }
    }

    async delete(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.Delete)
            const id = request.params.id
            const userService = UserServiceFactory()
            let r : boolean = await userService.delete(id)
            if(r){
                reply.send({message: 'Deleted successfully'})
            }else{
                reply.statusCode(400).send({message: 'Not deleted'})
            }
        } catch (e) {
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }
    }

    async myPassword(request, reply) {
        try {
            if(!request.authUser){
                throw new UnauthorizedError()
            }
            const userId = request.authUser.id
            const currentPassword = request.body.currentPassword
            const newPassword = request.body.newPassword
            const userService = UserServiceFactory()
            return await userService.changeOwnPassword(userId, currentPassword, newPassword)
        } catch (e) {
            console.error('/api/password error', e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }
    }

    async password(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.Update)
            const userId = request.params.id
            if(!userId){
                throw new UnauthorizedError()
            }
            const newPassword = request.body.newPassword
            const userService = UserServiceFactory()
            return await userService.changeUserPassword(userId, newPassword)
        } catch (e) {
            console.error('/api/password error', e)
            if (e instanceof ValidationError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message, inputErrors: e.errors})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'error.server'})
            }
        }
    }


    async updateAvatar(request, reply) {
        try {
            request.rbac.assertAuthenticated()
            const userId = request.rbac.getAuthUser.id

            const data = await request.file()

            const file = {
                filename: data.filename,
                fileStream: data.file,
                mimetype: data.mimetype
            }

            const destinationPath = join(BASE_FILE_DIR, AVATAR_DIR)
            const storedFile = await StoreManager.saveFile(file, destinationPath)
            const urlFile = BASE_URL + '/api/user/avatar/' + storedFile.filename

            //Save into DB
            const userService = UserServiceFactory()
            await userService.changeAvatar(userId, urlFile)

            return {
                filename: storedFile.filename,
                size: storedFile.size,
                mimetype: storedFile.mimetype,
                url: urlFile,
            }
        } catch (e) {
            console.error(e)
            if (e instanceof UploadFileError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else if (e instanceof UnauthorizedError) {
                reply.statusCode = e.statusCode
                reply.send({error: e.message})
            } else {
                reply.statusCode = 500
                reply.send({error: 'INTERNAL_SERVER_ERROR'})
            }
        }

    }

    async getAvatar(request, reply) {
        try {
            const filename = request.params.filename
            const subPath = 'avatar'
            const fileDir = join(BASE_FILE_DIR, subPath)
            //console.log("FILE_DIR: ",fileDir, " FILENAME:", filename)
            return reply.sendFile(filename, fileDir)
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


}

export default UserController;
export {
    UserController
}

