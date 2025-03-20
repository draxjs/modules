import {RoleModel} from "../../models/RoleModel.js";
import {IRoleRepository} from '../../interfaces/IRoleRepository'
import {mongoose, MongooseQueryFilter, MongooseSort} from "@drax/common-back";
import {Cursor} from "mongoose";
import {IDraxFindOptions} from "@drax/crud-share";
import {IRoleBase, IRole} from "@drax/identity-share";
import {AbstractMongoRepository} from "@drax/crud-back";

class RoleMongoRepository extends AbstractMongoRepository<IRole, IRoleBase,IRoleBase> implements IRoleRepository {

    protected _model = RoleModel
    protected _searchFields = ['name']
    protected _populateFields = ['childRoles']
    protected _lean = true

    constructor() {
        super();
        this._populateFields =  ['childRoles']
    }

    async findByName(name: string): Promise<IRole | null> {
        const item = await RoleModel
            .findOne({name})
            .populate(this._populateFields)
            .lean(this._lean ? { virtuals: true } : false)
            .exec()

        return item as IRole
    }



    async findCursor({
                   limit = 0,
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<Cursor> {
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
