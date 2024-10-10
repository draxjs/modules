import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IUserRepository} from "../interfaces/IUserRepository";
import {ZodError} from "zod";
import {ValidationError, ZodErrorToValidationError} from "@drax/common-back";
import AuthUtils from "../utils/AuthUtils.js";
import {createUserSchema, editUserSchema, userBaseSchema} from "../zod/UserZod.js";
import BadCredentialsError from "../errors/BadCredentialsError.js";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {AbstractService} from "@drax/crud-back";
import {ITenant} from "@drax/identity-share";

class UserService extends AbstractService<IUser, IUserCreate, IUserUpdate>{

    _repository: IUserRepository

    constructor(userRepository: IUserRepository) {
        super(userRepository,userBaseSchema);
        this._repository = userRepository;
        console.log("UserService constructor")
    }

    async auth(username: string, password: string) {
        let user = null
        console.log("auth username", username)
        user = await this.findByUsername(username)
        if (user && user.active && AuthUtils.checkPassword(password, user.password)) {
            //TODO: Generar Sesion
            const session = '123'
            const accessToken = AuthUtils.generateToken(user.id.toString(), user.username, user.role.id, user.tenant?.id, session)
            return {accessToken: accessToken}
        } else {
            throw new BadCredentialsError()
        }
    }

    async changeUserPassword(userId: string, newPassword: string) {
        const user = await this.findById(userId)
        if (user) {
            newPassword = AuthUtils.hashPassword(newPassword)
            await this._repository.changePassword(userId, newPassword)
            return true
        } else {
            throw new ValidationError([{field: 'userId', reason: 'validation.notFound'}])
        }
    }


    async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.findById(userId)


        if (user && user.active) {

            if (currentPassword === newPassword) {
                throw new ValidationError([{field: 'newPassword', reason: 'validation.password.currentDifferent'}])
            }

            if (AuthUtils.checkPassword(currentPassword, user.password)) {
                newPassword = AuthUtils.hashPassword(newPassword)
                await this._repository.changePassword(userId, newPassword)
                return true
            } else {
                throw new ValidationError([{field: 'currentPassword', reason: 'validation.notMatch'}])
            }

        } else {
            throw new BadCredentialsError()
        }
    }

    async changeAvatar(userId: string, avatar: string) {
        const user = await this.findById(userId)
        if (user && user.active) {
            await this._repository.changeAvatar(userId, avatar)
            return true
        } else {
            throw new BadCredentialsError()
        }
    }


    async create(userData: IUserCreate): Promise<IUser> {
        try {
            userData.name = userData?.name?.trim()
            userData.username = userData.username.trim()
            userData.password = userData.password.trim()
            userData.tenant = userData.tenant === "" ? null : userData.tenant

            await createUserSchema.parseAsync(userData)

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
            userData.name = userData.name.trim()
            userData.username = userData.username.trim()
            delete userData.password
            userData.tenant = userData.tenant === "" ? null : userData.tenant

            await editUserSchema.parseAsync(userData)


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
            if(!result){
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

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = false,
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

    async search(value: any): Promise<IUser[]> {
        const limit = 100
        const users: IUser[] = await this._repository.search(value, limit);
        return users;
    }
}

export default UserService
