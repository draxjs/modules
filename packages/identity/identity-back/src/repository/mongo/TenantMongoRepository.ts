import {TenantModel} from "../../models/TenantModel.js";
import {ITenant} from '../../interfaces/ITenant'
import {ITenantRepository} from '../../interfaces/ITenantRepository'
import {IPaginateFilter, IPaginateResult, mongoose} from "@drax/common-back";
import {FilterQuery, PaginateOptions, PaginateResult} from "mongoose";
import {DeleteResult} from "mongodb";

class TenantMongoRepository implements ITenantRepository{

    async create(tenantData: ITenant): Promise<ITenant> {
        const tenant : mongoose.HydratedDocument<ITenant> = new TenantModel(tenantData)
        await tenant.save()
        return tenant
    }

    async update(id: mongoose.Types.ObjectId | string, tenantData: ITenant): Promise<ITenant> {
        const tenant : mongoose.HydratedDocument<ITenant> = await TenantModel.findOneAndUpdate({_id: id}, tenantData, {new: true}).exec()
        return tenant
    }

    async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
        const result : DeleteResult = await TenantModel.deleteOne({_id:id}).exec()
        return result.deletedCount == 1
    }

    async findById(id: mongoose.Types.ObjectId): Promise<ITenant | null>{
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

    async paginate(page:number = 1, limit:number = 5, search:string): Promise<IPaginateResult>{

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
