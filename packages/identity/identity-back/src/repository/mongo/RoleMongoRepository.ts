import {RoleModel} from "../../models/RoleModel.js";
import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {mongoose, MongooseQueryFilter, MongooseSort} from "@drax/common-back";
import {PaginateOptions, PaginateResult} from "mongoose";
import {DeleteResult} from "mongodb";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";
import {IRoleBase, IRole} from "@drax/identity-share";

class RoleMongoRepository implements IRoleRepository{

    async create(roleData: IRoleBase): Promise<IRole> {
        const role : mongoose.HydratedDocument<IRole> = new RoleModel(roleData)
        await role.save()
        await role.populate('childRoles')
        return role
    }

    async update(id: string, roleData: IRoleBase): Promise<IRole> {
        const role : mongoose.HydratedDocument<IRole> = await RoleModel.findOneAndUpdate({_id: id}, roleData, {new: true}).populate('childRoles').exec()
        return role
    }

    async delete(id: string): Promise<boolean> {
        const result : DeleteResult = await RoleModel.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }

    async findById(id: string): Promise<IRole | null>{
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

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       order= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>> {
        const query = {}

        if(search){
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        const options = {populate: ['childRoles'], page, limit, sort} as PaginateOptions
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
