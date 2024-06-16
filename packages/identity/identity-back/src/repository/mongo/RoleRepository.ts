import {RoleModel} from "../../models/RoleModel.js";
import {IRole} from '../../interfaces/IRole'
import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {mongoose} from "@drax/common-back";
import {FilterQuery, PaginateOptions, PaginateResult} from "mongoose";
import {DeleteResult} from "mongodb";

class RoleRepository implements IRoleRepository{

    async create(roleData: IRole): Promise<IRole> {
        const role : mongoose.HydratedDocument<IRole> = new RoleModel(roleData)
        await role.save()
        return role
    }

    async update(id: mongoose.Types.ObjectId, roleData: IRole): Promise<IRole> {
        const role : mongoose.HydratedDocument<IRole> = await RoleModel.findOneAndUpdate(id, roleData, {new: true}).exec()
        return role
    }

    async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
        const result : DeleteResult = await RoleModel.deleteOne(id).exec()
        return result.deletedCount == 1
    }

    async findById(id: mongoose.Types.ObjectId): Promise<IRole | null>{
        const role: mongoose.HydratedDocument<IRole> | null = await RoleModel.findById(id).exec()
        return role
    }

    async fetch(): Promise<IRole[]>{
        const roles: mongoose.HydratedDocument<IRole>[] = await RoleModel.find().exec()
        return roles
    }

    async paginate(page = 1, limit = 5, filters): Promise<PaginateResult<IRole>>{

        const query = {} as FilterQuery<IRole>
        const options = {page, limit} as PaginateOptions

        const roles: PaginateResult<IRole> = await RoleModel.paginate(query, options)
        return roles
    }
}

export default RoleRepository
