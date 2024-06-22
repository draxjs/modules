import {UserModel} from "../../models/UserModel.js";
import {mongoose, MongooseErrorToValidationError, MongoServerErrorToValidationError, ValidationError} from "@drax/common-back"
import type {IPaginateFilter, IPaginateResult} from "@drax/common-back"
import type {IUser, IUserCreate, IUserUpdate} from "../../interfaces/IUser";
import {DeleteResult, MongoServerError} from "mongodb";
import type {IUserRepository} from "../../interfaces/IUserRepository";
import {PaginateResult} from "mongoose";
import RoleMongoRepository from "./RoleMongoRepository.js";

class UserMongoRepository implements IUserRepository {
    private roleRepository: RoleMongoRepository;


    constructor() {
        this.roleRepository = new RoleMongoRepository()
    }

    async create(userData: IUserCreate): Promise<IUser> {
        try{

            if(!await this.roleRepository.findById(userData.role as mongoose.Types.ObjectId)){
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

    async update(id: mongoose.Types.ObjectId, userData: IUserUpdate): Promise<IUser> {
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

    async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
        const result: DeleteResult = await UserModel.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }


    async findById(id: mongoose.Types.ObjectId): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findById(id).populate(['role','tenant']).exec()
        return user
    }

    async findByUsername(username: string): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOne({username: username}).populate(['role','tenant']).exec()
        return user
    }

    async paginate(page: number = 1, limit: number = 5, search?:string, filters?:IPaginateFilter[]): Promise<IPaginateResult> {


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

    async changePassword(id: mongoose.Types.ObjectId, password: string):Promise<boolean> {
        try{
        await UserModel.findOneAndUpdate({_id: id}, {password}).exec()
        return true
        }catch (e){
            console.error(e)
            return false
        }
    }
}

export default UserMongoRepository
