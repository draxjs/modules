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
            await user.populate('role')
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
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOneAndUpdate({_id: id}, userData, {new: true}).populate('role').exec()
        return user
        }catch (e){
            console.log("UserRepositoryUpdate e",typeof e, e.name, e, )
            if(e instanceof mongoose.Error.ValidationError){
                throw MongooseErrorToValidationError(e)
            }
            if(e instanceof MongoServerError || e.name === 'MongoServerError'){
                console.log("UserRepositoryUpdate e instanceof MongoServerError")
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
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findById(id).populate('role').exec()
        return user
    }

    async findByUsername(username: string): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOne({username: username}).populate('role').exec()
        return user
    }

    async paginate(page: number = 1, limit: number = 5): Promise<IPaginateResult> {

        const query = {}
        const options = {populate: ['role'], page: page, limit: limit }

        const userPaginated: PaginateResult<IUser> = await UserModel.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: userPaginated.totalDocs,
            items: userPaginated.docs
        }
    }
}

export default UserMongoRepository
