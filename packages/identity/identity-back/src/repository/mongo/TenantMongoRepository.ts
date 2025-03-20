import {TenantModel} from "../../models/TenantModel.js";
import {ITenantRepository} from '../../interfaces/ITenantRepository'
import {mongoose, MongooseSort, MongooseQueryFilter} from "@drax/common-back";
import {Cursor} from "mongoose";
import {IDraxFindOptions} from "@drax/crud-share";
import {ITenant, ITenantBase} from "@drax/identity-share";
import {AbstractMongoRepository} from "@drax/crud-back";

class TenantMongoRepository extends AbstractMongoRepository<ITenant, ITenantBase, ITenantBase> implements ITenantRepository {

    protected _model = TenantModel
    protected _searchFields: string[] = ['name']
    protected _populateFields: string[] = []
    protected _lean: boolean = true


    async findByName(name: string): Promise<ITenant | null> {
        const tenant  = await TenantModel
            .findOne({name})
            .lean(this._lean)
            .exec()
        return tenant as ITenant
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

        if(search){
            if(mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            }else{
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        return TenantModel.find(query).limit(limit).sort(sort).cursor() as Cursor;
    }
}

export default TenantMongoRepository
