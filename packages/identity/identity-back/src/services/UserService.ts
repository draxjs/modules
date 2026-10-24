import type {IAuthUser, IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IUserRepository} from "../interfaces/IUserRepository";

import {ZodError} from "zod";
import {SecuritySensitiveError, ValidationError, ZodErrorToValidationError} from "@drax/common-back";
import AuthUtils from "../utils/AuthUtils.js";
import {UserCreateSchema, UserUpdateSchema, UserBaseSchema} from "../schemas/UserSchema.js";
import BadCredentialsError from "../errors/BadCredentialsError.js";
import {IDraxGroupByOptions, IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {AbstractService} from "@drax/crud-back";
import {randomUUID} from "crypto"
import UserLoginFailServiceFactory from "../factory/UserLoginFailServiceFactory.js";
import UserSessionServiceFactory from "../factory/UserSessionServiceFactory.js";
import type PasswordPolicyService from "./PasswordPolicyService";
import PasswordPolicyServiceFactory from "../factory/PasswordPolicyServiceFactory.js";
import type UserPasswordHistoryService from "./UserPasswordHistoryService.js";
import UserPasswordHistoryServiceFactory from "../factory/UserPasswordHistoryServiceFactory.js";

import RefreshTokenService from "./RefreshTokenService.js";
import RefreshTokenServiceFactory from "../factory/RefreshTokenServiceFactory.js";
import TenantServiceFactory from "../factory/TenantServiceFactory.js";
import UserVerificationService from './UserVerificationService.js';
import {userSecretFields} from '../utils/UserSecrets.js';

class UserService extends AbstractService<IUser, IUserCreate, IUserUpdate> {

    _repository: IUserRepository

    constructor(
        userRepository: IUserRepository,
        private readonly passwordPolicyService: PasswordPolicyService = PasswordPolicyServiceFactory(),
        private readonly userPasswordHistoryService: UserPasswordHistoryService = UserPasswordHistoryServiceFactory(),
        private refreshTokenService?: RefreshTokenService
    ) {
        super(userRepository, UserBaseSchema);
        this._repository = userRepository;
    }

    private get refreshTokens(): RefreshTokenService {
        return this.refreshTokenService ??= RefreshTokenServiceFactory(this._repository);
    }

    async refresh(refreshToken: string) {
        if (!RefreshTokenService.enabled()) throw new BadCredentialsError();
        return this.refreshTokens.refresh(refreshToken);
    }

    async logout(refreshToken: string): Promise<void> {
        await this.refreshTokens.logout(refreshToken);
    }

    async auth(username: string, password: string, {userAgent, ip}, rememberMe: boolean = false) {
        let user = null
        user = await this.findByUsernameWithPassword(username)
        if (user && user.active && AuthUtils.checkPassword(password, user.password)) {

            const {sessionUUID, ...refresh} = await this.generateSession(user, userAgent, ip, rememberMe);

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
            return {accessToken: accessToken, user: user, session: sessionUUID, ...refresh}
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

    private async generateSession(user, userAgent, ip, rememberMe: boolean = false) {
        const sessionUUID = randomUUID()
        const refresh: {refreshToken?: string, refreshExpiresAt?: string} = rememberMe === true && RefreshTokenService.enabled()
            ? await this.refreshTokens.issue(user, sessionUUID) : {};
        const sessionService = UserSessionServiceFactory()
        await sessionService.create({
            user: user._id.toString(),
            uuid: sessionUUID,
            userAgent: userAgent,
            ip: ip,
            ...(refresh.refreshExpiresAt ? {rememberMe: true, refreshExpiresAt: refresh.refreshExpiresAt} : {})
        })
        return {sessionUUID, ...refresh};
    }

    async switchTenant(accessToken: string, tenantId: string, tenantName: string) {
        const newAccessToken = AuthUtils.switchTenant(accessToken, tenantId, tenantName)
        return {accessToken: newAccessToken}
    }

    /** Server-only: call only after verifying a trusted external identity, never an unverified email. */
    async authByEmail(email: string, createIfNotFound: boolean = false, userData: IUserCreate, {userAgent, ip}, rememberMe: boolean = false) {
        let user = await this.findByEmail(email)

        if (!user && createIfNotFound) {
            userData.password = userData.password ? userData.password : await this.passwordPolicyService.generateCompatiblePassword()
            userData.active = userData.active === undefined ? true : userData.active
            user = await this.create(userData)
        }

        // Email lookup and creation hide secrets; bind remembered sessions to the persisted hash.
        if (user && rememberMe === true && RefreshTokenService.enabled()) {
            user = await this._repository.findByIdWithPassword(user._id.toString())
        }

        if (user && user.active) {
            const {sessionUUID, ...refresh} = await this.generateSession(user, userAgent, ip, rememberMe);


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
            return {accessToken: accessToken, ...refresh}
        } else {
            throw new BadCredentialsError()
        }
    }


    async changeUserPassword(userId: string, newPassword: string):Promise<IUser> {
        const user = await this._repository.findByIdWithPassword(userId)
        if (user) {
            await this.passwordPolicyService.validatePassword(newPassword,  {
                field: 'newPassword',
                userId,
                currentPasswordHash: user.password
            })
            const newPasswordHash = AuthUtils.hashPassword(newPassword)
            await this._repository.changePassword(userId, newPasswordHash)
            await this.userPasswordHistoryService.create(userId, newPasswordHash)
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
                await this.passwordPolicyService.validatePassword(newPassword,  {
                    field: 'newPassword',
                    userId,
                    currentPasswordHash: user.password
                })
                const newPasswordHash = AuthUtils.hashPassword(newPassword)
                await this._repository.changePassword(userId, newPasswordHash)
                await this.userPasswordHistoryService.create(userId, newPasswordHash)
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
                await this.passwordPolicyService.validatePassword(newPassword, {
                    field: 'newPassword',
                    userId: user._id.toString(),
                    currentPasswordHash: user.password
                })
                const newPasswordHash = AuthUtils.hashPassword(newPassword)
                await this._repository.changePassword(user._id, newPasswordHash)
                await this.userPasswordHistoryService.create(user._id.toString(), newPasswordHash)
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

    async register(userData: IUserCreate, tenantName?: string): Promise<IUser> {
        let createdTenantId: string | undefined
        try {

            userData.emailVerified = false
            userData.phoneVerified = false
            userData.active = false

            // Email codes are issued by the persistent verification claim, never by create().
            delete userData.emailCode
            userData.phoneCode = randomUUID()


            if (tenantName !== undefined) {
                const name = tenantName.trim()
                if (!name) throw new ValidationError([{field: 'tenantName', reason: 'validation.required'}])
                // Validate before reserving a tenant name; create() still performs its normal checks.
                await UserCreateSchema.parseAsync(userData)
                await this.passwordPolicyService.validatePassword(userData.password)
                const tenants = TenantServiceFactory()
                if (await tenants.findByName(name)) {
                    throw new ValidationError([{field: 'tenantName', reason: 'validation.unique'}])
                }
                try {
                    const tenant = await tenants.create({name})
                    createdTenantId = tenant._id.toString()
                    userData.tenant = createdTenantId
                } catch (error) {
                    // The database unique index is authoritative, including competing registrations.
                    if (error instanceof ValidationError) {
                        throw new ValidationError(error.errors.map(field => ({
                            ...field, field: field.field === 'name' ? 'tenantName' : field.field
                        })))
                    }
                    throw error
                }
            }

            return await this.create(userData)
        } catch (e) {
            if (createdTenantId) {
                // Never remove a tenant if persistence succeeded but a later step (e.g. history) failed.
                const persisted = await this.findByUsername(userData.username)
                const tenant = persisted?.tenant
                const persistedTenantId = typeof tenant === 'string' ? tenant : tenant?._id?.toString()
                if (persistedTenantId !== createdTenantId) {
                    await TenantServiceFactory().delete(createdTenantId)
                }
            }
            console.error("Error registering user")
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, userData)
            }
            throw e
        }
    }

    async verifyEmail(emailCode: string): Promise<boolean> {
        return new UserVerificationService(this._repository).verify(emailCode)
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
            await this.passwordPolicyService.validatePassword(userData.password)

            const passwordHash = AuthUtils.hashPassword(userData.password.trim())
            userData.password = passwordHash

            const user: IUser = await this._repository.create(userData)
            await this.userPasswordHistoryService.create(user._id.toString(), passwordHash)
            return user
        } catch (e) {
            console.error("Error creating user")
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
            console.error("Error updating user")
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

    override async groupBy(options: IDraxGroupByOptions): Promise<any[]> {
        // Aggregations bypass normal entity projections and serialization.
        if (options.fields?.some(field => userSecretFields.some(secret => field.split('.')[0] === secret))) {
            throw new ValidationError([{field: 'fields', reason: 'validation.invalid'}])
        }
        return super.groupBy(options)
    }

    async search(value: any, limit: number = 1000, filters = []): Promise<IUser[]> {
        const users: IUser[] = await this._repository.search(value, limit, filters);
        return users;
    }
}

export default UserService
