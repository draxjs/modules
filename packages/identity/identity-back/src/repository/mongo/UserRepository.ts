import {UserModel} from "../../models/UserModel.js";
import {mongoose} from "@drax/common-back"
import {FilterQuery, PaginateOptions, PaginateResult} from "mongoose";
import {IUser} from "../../interfaces/IUser";
import {DeleteResult} from "mongodb";

class UserRepository {

    async create(userData: IUser): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = new UserModel(userData)
        await user.save()
        await user.populate('role')
        return user
    }

    async update(id: mongoose.Types.ObjectId, userData: IUser): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOneAndUpdate(id, userData).populate('role').exec()
        return user
    }

    async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
        const result: DeleteResult = await UserModel.deleteOne(id).exec()
        return result.deletedCount == 1
    }

    async findById(id: mongoose.Types.ObjectId): Promise<IUser> {
        console.log("id",id)
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findById(id).populate('role').exec()
        console.log("user",user)
        return user
    }

    async findByUsername(username: string): Promise<IUser> {
        const user: mongoose.HydratedDocument<IUser> = await UserModel.findOne({username: username}).populate('role').exec()
        return user
    }

    async paginate(page: number, limit: number, filters): Promise<PaginateResult<IUser>> {

        const query = {}
        const options = {populate: ['role'], page: page, limit: limit }

        const userPaginated: PaginateResult<IUser> = await UserModel.paginate(query, options)
        return userPaginated
    }
}

export default UserRepository
