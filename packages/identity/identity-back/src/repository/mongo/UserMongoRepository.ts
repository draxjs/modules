import {UserModel} from "../../models/UserModel.js";
import {mongoose, MongooseErrorToValidationError, MongoServerErrorToValidationError, ValidationError} from "@drax/common-back"
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import {DeleteResult, MongoServerError} from "mongodb";
import type {IUserRepository} from "../../interfaces/IUserRepository";
import {PaginateResult} from "mongoose";
import RoleMongoRepository from "./RoleMongoRepository.js";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";

class UserMongoRepository implements IUserRepository {
    private roleRepository: RoleMongoRepository;


    constructor() {
        this.roleRepository = new RoleMongoRepository()
    }

    async create(userData: IUserCreate): Promise<IUser> {
        try{

            if(!await this.roleRepository.findById(userData.role)){
                throw new ValidationError([{field: 'role', reason: 'validation.notfound', value: userData.role}])
            }

            const user: mongoose.HydratedDocument<IUser> = new UserModel(userData)
            await user.save()
            await user.populate(['role','tenant'])
            return user
        }catch (e){
            if(e instanceof mongoose.Error.ValidationError){
                throw MongooseErrorToValidationError(e)
            }
            throw e
        }

    }

    async update(id: string, userData: IUserUpdate): Promise<IUser> {
        try{
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOneAndUpdate({_id: id}, userData, {new: true}).populate(['role','tenant']).exec()
        return user
        }catch (e){
            if(e instanceof mongoose.Error.ValidationError){
                throw MongooseErrorToValidationError(e)
            }
            if(e instanceof MongoServerError || e.name === 'MongoServerError'){
                throw MongoServerErrorToValidationError(e)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        const result: DeleteResult = await UserModel.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }


    async findById(id:string): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findById(id).populate(['role','tenant']).exec()
        return user
    }

    async findByUsername(username: string): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOne({username: username}).populate(['role','tenant']).exec()
        return user
    }

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       orderDesc= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<IUser>> {

        const query = {}

        if(search){
            query['$or'] = [
                {username: new RegExp(search, 'i')},
                {email: new RegExp(search, 'i')},
                {name: new RegExp(search, 'i')},
            ]
        }

        if(filters){
            for(const filter of filters){
                if(filter.operator === '$eq'){
                    query[filter.field] = {$eq: filter.value}
                }
                if(filter.operator === '$ne'){
                    query[filter.field] = {$ne: filter.value}
                }
                if(filter.operator === '$in'){
                    query[filter.field] = {$in: filter.value}
                }
            }
        }

        const options = {populate: ['role','tenant'], page: page, limit: limit }

        const userPaginated: PaginateResult<IUser> = await UserModel.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: userPaginated.totalDocs,
            items: userPaginated.docs
        }
    }

    async changePassword(id: string, password: string):Promise<boolean> {
        try{
        await UserModel.findOneAndUpdate({_id: id}, {password}).exec()
        return true
        }catch (e){
            console.error(e)
            return false
        }
    }

    async changeAvatar(id: string, avatar: string):Promise<boolean> {
        try{
            await UserModel.findOneAndUpdate({_id: id}, {avatar}).exec()
            return true
        }catch (e){
            console.error(e)
            return false
        }
    }
}

export default UserMongoRepository
