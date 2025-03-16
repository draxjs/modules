import {RoleModel} from "../../models/RoleModel.js";
import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {mongoose, MongooseQueryFilter, MongooseSort} from "@drax/common-back";
import {Cursor, PaginateOptions, PaginateResult} from "mongoose";
import {DeleteResult} from "mongodb";
import {IDraxFindOptions, IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {IRoleBase, IRole} from "@drax/identity-share";

class RoleMongoRepository implements IRoleRepository {

    _searchFields = ['name']

    async create(roleData: IRoleBase): Promise<IRole> {
        const role: mongoose.HydratedDocument<IRole> = new RoleModel(roleData)
        await role.save()
        await role.populate('childRoles')
        return role
    }

    async update(id: string, roleData: IRoleBase): Promise<IRole> {
        const role: mongoose.HydratedDocument<IRole> = await RoleModel.findOneAndUpdate({_id: id}, roleData, {new: true}).populate('childRoles').exec()
        return role
    }

    async delete(id: string): Promise<boolean> {
        const result: DeleteResult = await RoleModel.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }

    async findById(id: string): Promise<IRole | null> {
        const role: mongoose.HydratedDocument<IRole> | null = await RoleModel.findById(id).populate('childRoles').exec()
        return role
    }

    async findByName(name: string): Promise<IRole | null> {
        const role: mongoose.HydratedDocument<IRole> | null = await RoleModel.findOne({name}).populate('childRoles').exec()
        return role
    }

    async fetchAll(): Promise<IRole[]> {
        const roles: mongoose.HydratedDocument<IRole>[] = await RoleModel.find().populate('childRoles').exec()
        return roles
    }

    async search(value: string, limit: number = 1000): Promise<IRole[]> {
        const query = {}
        if(mongoose.Types.ObjectId.isValid(value)) {
            query['_id'] = new mongoose.Types.ObjectId(value)
        }else if(value){
            query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(value.toString(), 'i')}))
        }
        const items: mongoose.HydratedDocument<IRole>[] = await RoleModel.find(query).limit(limit).exec()
        return items
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>> {
        const query = {}

        if(search){
            if(mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            }else{
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
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

    async find({
                   limit = 0,
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<IRole[]> {

        const query = {}

        if(search){
            if(mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            }else{
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        return await RoleModel.find(query).limit(limit).sort(sort)
    }

    async findCursor({
                   limit = 0,
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<Cursor> {
        console.log("RoleMongoRepository.findCursor called")
        const query = {}

        if(search){
            if(mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            }else{
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        return RoleModel.find(query).limit(limit).sort(sort).cursor() as Cursor;
    }
}

export default RoleMongoRepository
