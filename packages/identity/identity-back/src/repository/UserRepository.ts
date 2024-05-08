import {UserModel} from "../models/UserModel.js";
import {mongoose} from "@drax/common-back"
import {FilterQuery, PaginateOptions, PaginateResult} from "mongoose";
import {IUser} from "../interfaces/IUser";
import {DeleteResult} from "mongodb";

class UserRepository {

     async create(userData: IUser): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = new UserModel(userData)
        await user.save()
        return user
    }

     async update(_id: mongoose.Types.ObjectId, userData: IUser): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOneAndUpdate(_id, userData).exec()
        return user
    }

    async delete(_id: mongoose.Types.ObjectId): Promise<boolean> {
        const result : DeleteResult = await UserModel.deleteOne(_id).exec()
        return result.deletedCount == 1
    }

     async findById(_id: mongoose.Types.ObjectId): Promise<IUser>{
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findById(_id).exec()
        return user
    }

    async findByUsername(username: string): Promise<IUser>{
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOne({username: username}).exec()
        return user
    }

     async paginate(query ?: FilterQuery<IUser>, options ?: PaginateOptions): Promise<PaginateResult<IUser>>{
        const userPaginated: PaginateResult<IUser> = await UserModel.paginate(query, options)
        return userPaginated
    }
}

export default UserRepository
