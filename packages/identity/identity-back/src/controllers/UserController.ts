import type {IUser, IUserUpdate, IUserCreate} from "@drax/identity-share";
import {AbstractFastifyController} from "@drax/crud-back";
import RegistrationCompleteHtml from "../html/RegistrationCompleteHtml.js";
import {
    CommonConfig,
    DraxConfig,
    StoreManager,
    ValidationError,
    UnauthorizedError, SecuritySensitiveError, BadRequestError,
} from "@drax/common-back";

import UserServiceFactory from "../factory/UserServiceFactory.js";
import RoleServiceFactory from "../factory/RoleServiceFactory.js";
import UserService from "../services/UserService.js";
import UserPermissions from "../permissions/UserPermissions.js";
import BadCredentialsError from "../errors/BadCredentialsError.js";
import {join} from "path";
import {IdentityConfig} from "../config/IdentityConfig.js";
import UserEmailService from "../services/UserEmailService.js";
import {IDraxCrudEvent, IDraxFieldFilter} from "@drax/crud-share";
import TenantServiceFactory from "../factory/TenantServiceFactory.js";
import {CustomRequest} from "@drax/crud-back/dist";

const BASE_FILE_DIR = DraxConfig.getOrLoad(CommonConfig.FileDir) || 'files';
const AVATAR_DIR = DraxConfig.getOrLoad(IdentityConfig.AvatarDir) || 'avatar';
const BASE_URL = DraxConfig.getOrLoad(CommonConfig.BaseUrl) ? DraxConfig.get(CommonConfig.BaseUrl).replace(/\/$/, '') : ''


class UserController extends AbstractFastifyController<IUser, IUserCreate, IUserUpdate> {

    protected service: UserService

    constructor() {
        super(UserServiceFactory(), UserPermissions)
        this.tenantField = "tenant";
        this.tenantFilter = true;
        this.entityName = 'User'
    }

    async auth(request, reply) {
        try {
            const username = request.body.username
            const password = request.body.password
            const userAgent = request.headers['user-agent'];
            const ip = request.ip;
            const userService = UserServiceFactory()

            return await userService.auth(username, password,{userAgent, ip})
        } catch (e) {
            console.error('/api/auth error', e)
            if (e instanceof BadCredentialsError) {
                reply.code(e.statusCode)
                reply.send(e.body)
            }
            reply.code(500)
            reply.send({error: 'error.server'})
        }
    }

    async me(request, reply) {
        try {
            if (request.authUser) {
                const userService = UserServiceFactory()
                let user = await userService.findById(request.rbac.userId)
                user.password = undefined
                delete user.password

                //handle SwitchTenant setted in accessToken
                if(request.authUser.tenantId != user?.tenant?._id){
                    const tenantService = TenantServiceFactory()
                    const tenant = await tenantService.findById(request.authUser.tenantId)
                    if(tenant){
                        user.tenant = tenant
                    }
                }

                return user

            } else {
                throw new UnauthorizedError()

            }
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async onUserEvent(request: CustomRequest, action: string, resourceId: string = null, detail: string = null) {
        const requestData = this.extractRequestData(request)
        const eventData : IDraxCrudEvent = {
            action: action,
            entity: this.entityName,
            resourceId: resourceId.toString(),
            postItem: null,
            preItem: null,
            detail: detail,
            timestamp: new Date(),
            ...requestData
        }
        this.eventEmitter.emitCrudEvent(eventData)
    }

    async switchTenant(request, reply) {
        try {

            request.rbac.assertPermission(UserPermissions.SwitchTenant)

            if (request.authUser && request.token) {
                const tenantId = request.body.tenantId
                if(!tenantId){
                    throw new BadRequestError('Missing tenantId')
                }

                const tenant = await TenantServiceFactory().findById(tenantId);

                if(!tenant){
                    throw new BadRequestError('Invalid tenantId')
                }

                const tenantName = tenant?.name;
                const userService = UserServiceFactory()
                let {accessToken} = await userService.switchTenant(request.token, tenantId, tenantName)

                const detail = `Switched to tenant "${tenantName}" (ID: ${tenantId})`;
                this.onUserEvent(request,'switchTenant',request.rbac.userId, detail)

                return {accessToken}
            } else {
                throw new UnauthorizedError()
            }
        } catch (e) {
            this.handleError(e,reply)
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
            const filters: IDraxFieldFilter[] = this.parseFilters(request.query.filters)
            if (request.rbac.getAuthUser.tenantId) {
                filters.push({field: 'tenant', operator: 'eq', value: request.rbac.getAuthUser.tenantId})
            }
            let paginateResult = await userService.paginate({page, limit, orderBy, order, search, filters})
            for (let item of paginateResult.items) {
                item.password = undefined
                delete item.password
            }
            return paginateResult
        } catch (e) {
            this.handleError(e,reply)
        }
    }


    async search(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.View)
            const filters = []
            if (request.rbac.getAuthUser.tenantId) {
                filters.push({field: 'tenant', operator: 'eq', value: request.rbac.getAuthUser.tenantId})
            }
            const search = request.query.search
            let item = await this.service.search(search, 1000, filters)
            return item
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async register(request, reply) {
        try {
            if (request.rbac.getAuthUser) {
                throw new UnauthorizedError()
            }

            const payload = request.body

            const defaultRole = DraxConfig.getOrLoad(IdentityConfig.defaultRole)

            if (!defaultRole) {
                throw new ValidationError([{field: 'username', reason: 'Default role not found'}])
            }

            const roleService = RoleServiceFactory()
            const role = await roleService.findByName(defaultRole)

            if (!role) {
                throw new ValidationError([{field: 'role', reason: 'Role not found'}])
            } else if (role.name === 'Admin') {
                payload.tenant = null
            }

            payload.role = role._id.toString()
            payload.origin ??= 'Registry'

            const userService = UserServiceFactory()
            let user = await userService.register(payload)

            if(user){
                const detail = `User ${user?.username} registered successfully.`;
                this.onUserEvent(request,'register',user?._id, detail)

                //SEND EMAIL FOR EMAIL VERIFICATION
                await UserEmailService.emailVerifyCode(user.emailCode, user.email)

                return {
                    success: true,
                    message: 'User registered successfully.'
                }
            }


        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async verifyEmail(request, reply) {
        try {
            const emailCode = request.params.code
            const userService = UserServiceFactory()
            const r = await userService.verifyEmail(emailCode)
            if(r){
                const html = RegistrationCompleteHtml
                reply.header('Content-Type', 'text/html; charset=utf-8').send(html)
            }
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async verifyPhone(request, reply) {
        try {
            const phoneCode = request.params.code
            const userService = UserServiceFactory()
            return await userService.verifyPhone(phoneCode)
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async create(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.Create)
            const payload = request.body

            if (request.rbac.getAuthUser.tenantId) {
                payload.tenant = request.rbac.getAuthUser.tenantId
            }

            payload.origin ??= 'Admin'

            const userService = UserServiceFactory()
            let user = await userService.create(payload)
            this.onCreated(request, user)
            return user
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async update(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.Update)
            const id = request.params.id
            const payload = request.body

            if (request.rbac.getAuthUser.tenantId) {
                payload.tenant = request.rbac.getAuthUser.tenantId
            }

            const userService = UserServiceFactory()
            let preUser = await userService.findById(id)
            let user = await userService.update(id, payload)
            this.onUpdated(request, preUser, user)
            return user
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async delete(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.Delete)
            const id = request.params.id
            const userService = UserServiceFactory()
            let preUser = await userService.findById(id)
            let r: boolean = await userService.delete(id)
            if (r) {
                this.onDeleted(request, preUser)
                reply.send({
                    id: id,
                    message: 'Item deleted successfully',
                    deleted: true,
                    deletedAt: new Date(),
                })
            } else {
                reply.send({
                    id: id,
                    message: 'Item not deleted',
                    deleted: false,
                    deletedAt: new Date(),
                })
            }
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async passwordRecoveryRequest(request, reply) {
        //let message = 'Si el correo electrónico existe, se han enviado instrucciones.'
        let message = 'user.events.recoveryPasswordInfo'

        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const email = request.body.email

            if(!email || !emailRegex.test(email)){
                throw new ValidationError([{field: 'email', reason: 'validation.email.invalid'}])
            }

            const userService = UserServiceFactory()
            const user = await userService.findByEmail(email)
            const code = await userService.recoveryCode(email)

            console.log("CODE", code)

            if (code) {
                await UserEmailService.recoveryCode(code, email)
            }

            const detail = `User ${user?.username} request a password recovery .`;
            this.onUserEvent(request,'passwordRecoveryRequest',user?._id, detail)

            reply.send({message})

        } catch (e) {
            console.error("ERROR RECOVERY", e)
            if(e instanceof SecuritySensitiveError){
                reply.send({message})
            }else{
                this.handleError(e,reply)
            }
        }
    }

    async recoveryPasswordComplete(request, reply) {

        try {
            const recoveryCode = request.body.recoveryCode
            const newPassword = request.body.newPassword

            if(!recoveryCode){
                throw new ValidationError([{field:'recoveryCode', reason: 'validation.required'}])
            }

            if(!newPassword){
                throw new ValidationError([{field:'newPassword', reason: 'validation.required'}])
            }

            const userService = UserServiceFactory()
            const user: IUser = await userService.changeUserPasswordByCode(recoveryCode, newPassword)
            if(user){
                const detail = `User ${user?.username} complete a password recovery .`;
                this.onUserEvent(request,'passwordRecoveryCompleted',user?._id, detail)
                reply.send({message: 'action.success'})
            }else{
                reply.statusCode = 400
                reply.send({message: 'action.failure'})
            }

        } catch (e) {
            this.handleError(e,reply)
        }
    }


    async changeMyPassword(request, reply) {
        try {
            if (!request.authUser) {
                throw new UnauthorizedError()
            }
            const userId = request.authUser.id
            const currentPassword = request.body.currentPassword
            const newPassword = request.body.newPassword
            const userService = UserServiceFactory()
            const user = await userService.changeOwnPassword(userId, currentPassword, newPassword)
            const detail = `User ${user?.username} changed his password.`;
            this.onUserEvent(request,'changeMyPassword',user?._id, detail)
            return {message: 'Password updated successfully'}
        } catch (e) {
            this.handleError(e,reply)
        }
    }

    async changePassword(request, reply) {
        try {
            request.rbac.assertPermission(UserPermissions.ChangePassword)
            const userId = request.params.id
            if (!userId) {
                throw new UnauthorizedError()
            }
            const newPassword = request.body.newPassword
            const userService = UserServiceFactory()
            const user = await userService.changeUserPassword(userId, newPassword)
            const detail = `User ${request.rbac.username} changed password for user ${user.username}.`;
            this.onUserEvent(request,'changePassword',user?._id, detail)
            return {message: 'Password updated successfully'}
        } catch (e) {
            this.handleError(e,reply)
        }
    }


    async updateAvatar(request, reply) {
        try {
            request.rbac.assertAuthenticated()
            const userId = request.rbac.userId

            const data = await request.file()

            const file = {
                filename: data.filename,
                fileStream: data.file,
                mimetype: data.mimetype
            }

            const destinationPath = join(BASE_FILE_DIR, AVATAR_DIR)
            const storedFile = await StoreManager.saveFile(file, destinationPath)
            const urlFile = BASE_URL + '/api/users/avatar/' + storedFile.filename

            //Save into DB
            const userService = UserServiceFactory()
            const user = await userService.changeAvatar(userId, urlFile)

            const detail = `User ${request.rbac.username} changed avatar.`
            this.onUserEvent(request,'changeAvatar',user?._id, detail)

            return {
                filename: storedFile.filename,
                size: storedFile.size,
                mimetype: storedFile.mimetype,
                url: urlFile,
            }
        } catch (e) {
            this.handleError(e,reply)
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
            this.handleError(e,reply)
        }

    }


}

export default UserController;
export {
    UserController
}

