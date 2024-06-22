import {RoleModel} from "../../models/RoleModel.js";
import {IRole} from '../../interfaces/IRole'
import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {IPaginateFilter, IPaginateResult, mongoose} from "@drax/common-back";
import {FilterQuery, PaginateOptions, PaginateResult} from "mongoose";
import {DeleteResult} from "mongodb";

class RoleMongoRepository implements IRoleRepository{

    async create(roleData: IRole): Promise<IRole> {
        const role : mongoose.HydratedDocument<IRole> = new RoleModel(roleData)
        await role.save()
        await role.populate('childRoles')
        return role
    }

    async update(id: mongoose.Types.ObjectId | string, roleData: IRole): Promise<IRole> {
        const role : mongoose.HydratedDocument<IRole> = await RoleModel.findOneAndUpdate({_id: id}, roleData, {new: true}).populate('childRoles').exec()
        return role
    }

    async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
        const result : DeleteResult = await RoleModel.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }

    async findById(id: mongoose.Types.ObjectId): Promise<IRole | null>{
        const role: mongoose.HydratedDocument<IRole> | null = await RoleModel.findById(id).populate('childRoles').exec()
        return role
    }

    async findByName(name: string): Promise<IRole | null>{
        const role: mongoose.HydratedDocument<IRole> | null = await RoleModel.findOne({name}).populate('childRoles').exec()
        return role
    }

    async fetchAll(): Promise<IRole[]>{
        const roles: mongoose.HydratedDocument<IRole>[] = await RoleModel.find().populate('childRoles').exec()
        return roles
    }

    async paginate(page:number = 1, limit:number = 5, search:string): Promise<IPaginateResult>{

        const query = {}

        if(search){
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        const options = {populate: ['childRoles'], page, limit} as PaginateOptions
        const roles: PaginateResult<IRole> = await RoleModel.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: roles.totalDocs,
            items: roles.docs
        }
    }
}

export default RoleMongoRepository
