import {UserModel} from "../../models/UserModel.js";
import {mongoose, MongooseErrorToValidationError} from "@drax/common-back"
import type {IPaginateFilter, IPaginateResult} from "@drax/common-back"
import {IUser} from "../../interfaces/IUser";
import {DeleteResult} from "mongodb";
import {IUserRepository} from "../../interfaces/IUserRepository";
import {PaginateResult} from "mongoose";

class UserMongoRepository implements IUserRepository {

    async create(userData: IUser): Promise<IUser> {
        try{
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

    async update(id: mongoose.Types.ObjectId, userData: IUser): Promise<IUser> {
        try{
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOneAndUpdate(id, userData, {new: true}).populate('role').exec()
        return user
        }catch (e){
            if(e instanceof mongoose.Error.ValidationError){
                throw MongooseErrorToValidationError(e)
            }
            throw e
        }
    }

    async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
        const result: DeleteResult = await UserModel.deleteOne(id).exec()
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
