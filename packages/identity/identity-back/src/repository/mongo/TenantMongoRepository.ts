import {TenantModel} from "../../models/TenantModel.js";
import {ITenantRepository} from '../../interfaces/ITenantRepository'
import {mongoose, MongooseSort, MongooseQueryFilter} from "@drax/common-back";
import {Cursor, PaginateOptions, PaginateResult} from "mongoose";
import {DeleteResult} from "mongodb";
import {IDraxFindOptions, IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {ITenant, ITenantBase} from "@drax/identity-share";

class TenantMongoRepository implements ITenantRepository {

    _searchFields = ['_id','name']

    async create(tenantData: ITenantBase): Promise<ITenant> {
        const tenant: mongoose.HydratedDocument<ITenant> = new TenantModel(tenantData)
        await tenant.save()
        return tenant
    }

    async update(id: string, tenantData: ITenantBase): Promise<ITenant> {
        const tenant: mongoose.HydratedDocument<ITenant> = await TenantModel.findOneAndUpdate({_id: id}, tenantData, {new: true}).exec()
        return tenant
    }

    async delete(id: string): Promise<boolean> {
        const result: DeleteResult = await TenantModel.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }

    async findById(id: string): Promise<ITenant | null> {
        const tenant: mongoose.HydratedDocument<ITenant> | null = await TenantModel.findById(id).exec()
        return tenant
    }

    async findByName(name: string): Promise<ITenant | null> {
        const tenant: mongoose.HydratedDocument<ITenant> | null = await TenantModel.findOne({name}).exec()
        return tenant
    }

    async fetchAll(): Promise<ITenant[]> {
        const tenants: mongoose.HydratedDocument<ITenant>[] = await TenantModel.find().exec()
        return tenants
    }

    async search(value: string, limit: number = 1000): Promise<ITenant[]> {
        const query = {}
        if(value){
            query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(value.toString(), 'i')}))
        }
        const items: mongoose.HydratedDocument<ITenant>[] = await TenantModel.find(query).limit(limit).exec()
        return items
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>> {

        const query = {}

        if (search) {
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        const options = {page, limit, sort} as PaginateOptions
        const tenants: PaginateResult<ITenant> = await TenantModel.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: tenants.totalDocs,
            items: tenants.docs
        }
    }

    async find({
                   limit = 0,
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<ITenant[]> {

        const query = {}

        if (search) {
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)
        const items: ITenant[] = await TenantModel.find(query).limit(limit).sort(sort)
        return items
    }

    async findCursor({
                         limit = 0,
                         orderBy = '',
                         order = false,
                         search = '',
                         filters = []
                     }: IDraxFindOptions): Promise<Cursor> {
        console.log("TenantMongoRepository.findCursor called")
        const query = {}

        if (search) {
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        return TenantModel.find(query).limit(limit).sort(sort).cursor() as Cursor;
    }
}

export default TenantMongoRepository
