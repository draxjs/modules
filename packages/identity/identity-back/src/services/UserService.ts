import type {IUser, IUserCreate, IUserUpdate} from "../interfaces/IUser";
import type {IUserRepository} from "../interfaces/IUserRepository";
import type {IPaginateFilter, IPaginateResult} from "@drax/common-back"
import {ZodError} from "zod";
import {ValidationError, ZodErrorToValidationError} from "@drax/common-back";
import AuthUtils from "../utils/AuthUtils.js";
import {createUserSchema, editUserSchema,} from "../zod/UserZod.js";
import BadCredentialsError from "../errors/BadCredentialsError.js";

class UserService {

    _repository: IUserRepository

    constructor(userRepository: IUserRepository) {
        this._repository = userRepository;
        console.log("UserService constructor")
    }

    async auth(username : string, password : string){
        let user = null
        console.log("auth username",username)
        user = await this.findByUsername(username)
        if (user && user.active && AuthUtils.checkPassword(password, user.password)) {
            //TODO: Generar Sesion
            const session = '123'
            const accessToken = AuthUtils.generateToken(user.id.toString(), user.username, user.role.id, session)
            return {accessToken: accessToken}
        }else{
            throw new BadCredentialsError()
        }
    }

    async changeUserPassword(userId : string, newPassword : string){
        const user = await this.findById(userId)
        if(user){
            newPassword =  AuthUtils.hashPassword(newPassword)
            await this._repository.changePassword(userId, newPassword)
            return true
        }else{
            throw new ValidationError([{field: 'userId', reason: 'validation.notFound'}])
        }
    }


    async changeOwnPassword(userId : string, currentPassword : string, newPassword : string){
        const user = await this.findById(userId)
        if(user && user.active){
            if (AuthUtils.checkPassword(currentPassword, user.password)) {
                newPassword =  AuthUtils.hashPassword(newPassword)
                await this._repository.changePassword(userId, newPassword)
                return true
            }else{
                throw new ValidationError([{field: 'currentPassword', reason: 'validation.notMatch'}])
            }

        }else{
            throw new BadCredentialsError()
        }
    }


    async create(userData: IUserCreate): Promise<IUser> {
        try{
            userData.name = userData?.name?.trim()
            userData.username = userData.username.trim()
            userData.password = userData.password.trim()

            await createUserSchema.parseAsync(userData)

            userData.password = AuthUtils.hashPassword(userData.password.trim())

            const user: IUser = await this._repository.create(userData)
            return user
        }catch (e){
            if(e instanceof ZodError){
                throw ZodErrorToValidationError(e,userData)
            }
            throw e
        }


    }

    async update(id: any, userData: IUserUpdate) {
        try{
        userData.name = userData.name.trim()
        userData.username = userData.username.trim()
        delete userData.password

        await editUserSchema.parseAsync(userData)


        const user: IUser = await this._repository.update(id, userData)
        return user
        }catch (e){
            if(e instanceof ZodError){
                throw ZodErrorToValidationError(e,userData)
            }
            throw e
        }
    }

    async delete(id: any): Promise<boolean> {
        const deletedRole: boolean = await this._repository.delete(id);
        return deletedRole;
    }

    async findById(id: any): Promise<IUser> {
        const user: IUser = await this._repository.findById(id);
        return user
    }

    async findByUsername(username: string): Promise<IUser | null> {
        const user: IUser = await this._repository.findByUsername(username);
        return user
    }

    async paginate( page : number = 1, limit : number = 10, filters ?: IPaginateFilter[]): Promise<IPaginateResult> {

        const pagination = await this._repository.paginate( page, limit, filters);
        return pagination;
    }
}

export default UserService
