import {UserApiKeyModel} from "../../models/UserApiKeyModel.js";
import {
    mongoose,
    MongooseQueryFilter,
    MongooseSort,
} from "@drax/common-back"
import type {IUserApiKey, IUserApiKeyBase, IUserApiKeySoftDelete} from "@drax/identity-share";
import {PaginateResult} from "mongoose";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {IUserApiKeyRepository} from "../../interfaces/IUserApiKeyRepository";
import {AbstractMongoRepository} from "@drax/crud-back";

class UserApiKeyMongoRepository extends AbstractMongoRepository<IUserApiKey,IUserApiKeyBase,IUserApiKeyBase> implements IUserApiKeyRepository {

    protected _searchFields=['name']
    protected _populateFields  = [
        {path: 'user', populate: {path: 'tenant role'} },
        {path: 'createdBy', populate: {path: 'tenant role'} },
    ]
    protected _model = UserApiKeyModel
    protected _lean = true


    async delete(id: string): Promise<boolean> {
        const userApiKey: mongoose.HydratedDocument<IUserApiKeySoftDelete> = await UserApiKeyModel
            .findById(id)
        userApiKey.softDelete()
        return true
    }



    async findBySecret(secret: string): Promise<IUserApiKey> {
        const userApiKey = await UserApiKeyModel
            .findOne({secret: {$eq: secret}, deleted: {$ne: true} })
            .populate(this._populateFields)
            .exec()
        return userApiKey as IUserApiKey
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = "asc",
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>> {

        const query = {
            deleted: false
        }

        if(search){
            if(mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            }else{
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)
        const populate = ['user', 'user.tenant', 'user.role', 'createdBy']
        const lean = this._lean
        const leanWithId = this._lean
        const leanWithVirtuals = this._lean
        const options = {populate , page, limit, sort, lean, leanWithId, leanWithVirtuals}

        const userApiKeyPaginated: PaginateResult<IUserApiKey> = await UserApiKeyModel.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: userApiKeyPaginated.totalDocs,
            items: userApiKeyPaginated.docs
        }
    }

}

export default UserApiKeyMongoRepository
