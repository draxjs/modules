import {TenantModel} from "../../models/TenantModel.js";
import {ITenantRepository} from '../../interfaces/ITenantRepository'
import { mongoose} from "@drax/common-back";
import {FilterQuery, PaginateOptions, PaginateResult} from "mongoose";
import {DeleteResult} from "mongodb";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";
import {ITenant, ITenantBase} from "@drax/identity-share";

class TenantMongoRepository implements ITenantRepository{

    async create(tenantData: ITenantBase): Promise<ITenant> {
        const tenant : mongoose.HydratedDocument<ITenant> = new TenantModel(tenantData)
        await tenant.save()
        return tenant
    }

    async update(id: string, tenantData: ITenantBase): Promise<ITenant> {
        const tenant : mongoose.HydratedDocument<ITenant> = await TenantModel.findOneAndUpdate({_id: id}, tenantData, {new: true}).exec()
        return tenant
    }

    async delete(id: string): Promise<boolean> {
        const result : DeleteResult = await TenantModel.deleteOne({_id:id}).exec()
        return result.deletedCount == 1
    }

    async findById(id: string): Promise<ITenant | null>{
        const tenant: mongoose.HydratedDocument<ITenant> | null = await TenantModel.findById(id).exec()
        return tenant
    }

    async findByName(name: string): Promise<ITenant | null>{
        const tenant: mongoose.HydratedDocument<ITenant> | null = await TenantModel.findOne({name}).exec()
        return tenant
    }

    async fetchAll(): Promise<ITenant[]>{
        const tenants: mongoose.HydratedDocument<ITenant>[] = await TenantModel.find().exec()
        return tenants
    }

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       orderDesc= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>> {

        const query = {}

        if(search){
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        const options = {page, limit} as PaginateOptions
        const tenants: PaginateResult<ITenant> = await TenantModel.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: tenants.totalDocs,
            items: tenants.docs
        }
    }
}

export default TenantMongoRepository
