import {IUser} from "../interfaces/IUser";
import {IUserRepository} from "../interfaces/IUserRepository";
import AuthUtils from "../utils/AuthUtils.js";
import {UserZod} from "../zod/UserZod.js";
import {ZodError} from "zod";
import type {IPaginateFilter, IPaginateResult} from "@drax/common-back"
import {TransformZodValidationError} from "@drax/common-back";

class UserService {

    _repository: IUserRepository

    constructor(userRepository: IUserRepository) {
        this._repository = userRepository;
    }

    async auth(username : string, password : string){
        let user = null
        console.log("auth username",username)
        user = await this.findByUsername(username)
        if (user && user.active && AuthUtils.checkPassword(password, user.password)) {
            //TODO: Generar Sesion
            const session = '123'
            const accessToken = AuthUtils.generateToken(user.id.toString(), user.username, session)
            return {accessToken: accessToken}
        }else{
            throw Error('BadCredentials')
        }
    }

    async create(userData: IUser): Promise<IUser> {
        try{
            userData.name = userData?.name?.trim()
            userData.username = userData.username.trim()

            await UserZod.parseAsync(userData)

            userData.password = AuthUtils.hashPassword(userData.password.trim())

            const user: IUser = await this._repository.create(userData)
            return user
        }catch (e){
            if(e instanceof ZodError){
                throw TransformZodValidationError(e,userData,'User')
            }
            throw e
        }


    }

    async update(id: any, userData: IUser) {

        userData.name = userData.name.trim()
        userData.username = userData.username.trim()
        delete userData.password

        const user: IUser = await this._repository.update(id, userData)
        return user
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
