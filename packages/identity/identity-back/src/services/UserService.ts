import type {IAuthUser, IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IUserRepository} from "../interfaces/IUserRepository";

import {ZodError} from "zod";
import {SecuritySensitiveError, ValidationError, ZodErrorToValidationError} from "@drax/common-back";
import AuthUtils from "../utils/AuthUtils.js";
import {UserCreateSchema, UserUpdateSchema, UserBaseSchema} from "../schemas/UserSchema.js";
import BadCredentialsError from "../errors/BadCredentialsError.js";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {AbstractService} from "@drax/crud-back";
import {randomUUID} from "crypto"
import UserLoginFailServiceFactory from "../factory/UserLoginFailServiceFactory.js";
import UserSessionServiceFactory from "../factory/UserSessionServiceFactory.js";

class UserService extends AbstractService<IUser, IUserCreate, IUserUpdate> {

    _repository: IUserRepository

    constructor(userRepository: IUserRepository) {
        super(userRepository, UserBaseSchema);
        this._repository = userRepository;
    }

    async auth(username: string, password: string, {userAgent, ip}) {
        let user = null
        user = await this.findByUsernameWithPassword(username)
        if (user && user.active && AuthUtils.checkPassword(password, user.password)) {

            const sessionUUID = await this.generateSession(user, userAgent, ip);

            const tokenPayload: IAuthUser = {
                id: user._id.toString(),
                username: user.username,
                roleId: user.role?._id?.toString(),
                roleName: user.role?.name,
                tenantId: user.tenant ? user.tenant?._id?.toString() : null,
                tenantName: user.tenant ? user.tenant?.name : null,
                session: sessionUUID
            }

            const accessToken = AuthUtils.generateToken(tokenPayload)
            delete user.password
            return {accessToken: accessToken, user: user, session: sessionUUID}
        } else {
            const userLoginFailService = UserLoginFailServiceFactory()
            await userLoginFailService.create({
                username: username,
                userAgent: userAgent,
                ip: ip
            })
            throw new BadCredentialsError()
        }
    }

    private async generateSession(user, userAgent, ip) {
        const sessionUUID = randomUUID()
        const sessionService = UserSessionServiceFactory()
        await sessionService.create({
            user: user._id.toString(),
            uuid: sessionUUID,
            userAgent: userAgent,
            ip: ip
        })
        return sessionUUID;
    }

    async switchTenant(accessToken: string, tenantId: string, tenantName: string) {
        const newAccessToken = AuthUtils.switchTenant(accessToken, tenantId, tenantName)
        return {accessToken: newAccessToken}
    }

    async authByEmail(email: string, createIfNotFound: boolean = false, userData: IUserCreate, {userAgent, ip}) {
        let user = null
        console.log("auth email", email)
        user = await this.findByEmail(email)

        if (!user && createIfNotFound) {
            userData.password = userData.password ? userData.password : randomUUID()
            userData.active = userData.active === undefined ? true : userData.active
            user = await this.create(userData)
        }

        if (user && user.active) {
            const sessionUUID = await this.generateSession(user, userAgent, ip);


            const tokenPayload: IAuthUser = {
                id: user._id.toString(),
                username: user.username,
                roleId: user.role?._id?.toString(),
                roleName: user.role?.name,
                tenantId: user.tenant ? user.tenant?._id?.toString() : null,
                tenantName: user.tenant ? user.tenant?.name : null,
                session: sessionUUID
            }

            const accessToken = AuthUtils.generateToken(tokenPayload)
            return {accessToken: accessToken}
        } else {
            throw new BadCredentialsError()
        }
    }


    async changeUserPassword(userId: string, newPassword: string):Promise<IUser> {
        const user = await this._repository.findByIdWithPassword(userId)
        if (user) {
            newPassword = AuthUtils.hashPassword(newPassword)
            await this._repository.changePassword(userId, newPassword)
            delete user.password
            return user
        } else {
            throw new ValidationError([{field: 'userId', reason: 'validation.notFound'}])
        }
    }


    async changeOwnPassword(userId: string, currentPassword: string, newPassword: string): Promise<IUser> {
        const user = await this._repository.findByIdWithPassword(userId)
        if (user && user.active) {

            if (currentPassword === newPassword) {
                throw new ValidationError([{field: 'newPassword', reason: 'validation.password.currentDifferent'}])
            }

            if (AuthUtils.checkPassword(currentPassword, user.password)) {
                newPassword = AuthUtils.hashPassword(newPassword)
                await this._repository.changePassword(userId, newPassword)
                delete user.password
                return user
            } else {
                throw new ValidationError([{field: 'currentPassword', reason: 'validation.notMatch'}])
            }

        } else {
            throw new BadCredentialsError()
        }
    }

    async changeAvatar(userId: string, avatar: string):Promise<IUser> {
        const user = await this.findById(userId)
        if (user && user.active) {
            await this._repository.changeAvatar(userId, avatar)
            return user
        } else {
            throw new BadCredentialsError()
        }
    }

    async recoveryCode(email: string): Promise<string> {
        try{
            const recoveryCode = randomUUID()
            const user = await this._repository.findByEmail(email)
            if(user && user.active){
                await this._repository.updatePartial(user._id, {recoveryCode: recoveryCode})
                return recoveryCode
            }else{
                throw new SecuritySensitiveError()
            }
        }catch (e) {
            console.error("recoveryCode:", e)
            throw e
        }
    }

    async changeUserPasswordByCode(recoveryCode: string, newPassword: string): Promise<IUser> {
        try {
            const user = await this._repository.findByRecoveryCode(recoveryCode)
            if (user && user.active) {
                newPassword = AuthUtils.hashPassword(newPassword)
                await this._repository.changePassword(user._id, newPassword)
                await this._repository.updatePartial(user._id, {recoveryCode: null})
                return user
            } else {
                throw new ValidationError([{field:'recoveryCode', reason: 'validation.notFound'}])
            }
        } catch (e) {
            console.error("changeUserPasswordByCode", e)
            throw e
        }
    }

    async register(userData: IUserCreate): Promise<IUser> {
        try {

            userData.emailVerified = false
            userData.phoneVerified = false
            userData.active = false

            userData.emailCode = randomUUID()
            userData.phoneCode = randomUUID()


            let user = await this.create(userData)

            return user
        } catch (e) {
            console.error("Error registry user", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, userData)
            }
            throw e
        }
    }

    async verifyEmail(emailCode: string): Promise<boolean> {
        const user = await this._repository.findByEmailCode(emailCode)
        if (user && user.emailVerified === false) {
            await this._repository.updatePartial(user._id, {
                emailVerified: true,
                active: true
            })
            return true
        } else {
            throw new ValidationError([{field: 'emailCode', reason: 'validation.notFound'}])
        }
    }

    async verifyPhone(phoneCode: string): Promise<boolean> {
        const user = await this._repository.findByPhoneCode(phoneCode)
        if (user && user.phoneVerified === false) {
            await this._repository.updatePartial(user._id, {
                phoneVerified: true,
                active: true
            })
            return true
        } else {
            throw new ValidationError([{field: 'phoneCode', reason: 'validation.notFound'}])
        }
    }

    async create(userData: IUserCreate): Promise<IUser> {
        try {
            userData.name = userData?.name?.trim()
            userData.username = userData?.username.trim()
            userData.password = userData?.password.trim()
            userData.tenant = userData.tenant === "" ? null : userData.tenant

            await UserCreateSchema.parseAsync(userData)

            userData.password = AuthUtils.hashPassword(userData.password.trim())

            const user: IUser = await this._repository.create(userData)
            return user
        } catch (e) {
            console.error("Error creating user", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, userData)
            }
            throw e
        }
    }

    async update(id: string, userData: IUserUpdate) {
        try {
            userData.name = userData?.name.trim()
            userData.username = userData?.username.trim()
            delete userData.password
            userData.tenant = userData.tenant === "" ? null : userData.tenant

            await UserUpdateSchema.parseAsync(userData)


            const user: IUser = await this._repository.update(id, userData)
            return user
        } catch (e) {
            console.error("Error updating user", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, userData)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result: boolean = await this._repository.delete(id);
            if (!result) {
                throw new Error("error.deletionFailed")
            }
            return result;
        } catch (e) {
            console.error("Error deleting user", e)
            throw e
        }

    }

    async findById(id: string): Promise<IUser> {
        try {
            const user: IUser = await this._repository.findById(id);
            return user
        } catch (e) {
            console.error("Error finding user by id", e)
            throw e
        }

    }

    async findByUsername(username: string): Promise<IUser | null> {
        try {
            const user: IUser = await this._repository.findByUsername(username);
            return user
        } catch (e) {
            console.error("Error finding user by username", e)
            throw e
        }

    }

    async findByUsernameWithPassword(username: string): Promise<IUser | null> {
        try {
            const user: IUser = await this._repository.findByUsernameWithPassword(username);
            return user
        } catch (e) {
            console.error("Error finding user by username", e)
            throw e
        }

    }

    async findByEmail(email: string): Promise<IUser | null> {
        try {
            const user: IUser = await this._repository.findByEmail(email);
            return user
        } catch (e) {
            console.error("Error finding user by username", e)
            throw e
        }
    }

    async paginate({
                       page = 1,
                       limit = 10,
                       orderBy = '',
                       order = "asc",
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUser>> {
        try {
            const pagination = await this._repository.paginate({page, limit, orderBy, order, search, filters});
            return pagination;
        } catch (e) {
            console.error("Error paginating users", e)
            throw e;
        }

    }

    async search(value: any, limit: number = 1000, filters = []): Promise<IUser[]> {
        const users: IUser[] = await this._repository.search(value, limit, filters);
        return users;
    }
}

export default UserService
