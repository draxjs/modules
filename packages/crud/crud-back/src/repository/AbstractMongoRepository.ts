import "mongoose-paginate-v2";
import mongoose from "mongoose";
import type {Cursor, PopulateOptions} from "mongoose";
import {
    MongooseQueryFilter,
    MongooseSort,
    MongooseValidationErrorToValidationError,
    MongooseCastErrorToValidationError,
    MongoServerErrorToValidationError
} from "@drax/common-back";
import type {DeleteResult} from "mongodb";
import type {IDraxPaginateOptions, IDraxPaginateResult, IDraxFindOptions, IDraxCrud, IDraxFieldFilter} from "@drax/crud-share";
import type {PaginateModel, PaginateOptions, PaginateResult} from "mongoose";
import {InvalidIdError} from "@drax/common-back";
import {MongoServerError} from "mongodb";


class AbstractMongoRepository<T, C, U> implements IDraxCrud<T, C, U> {

    protected _model: mongoose.Model<T> & PaginateModel<T>
    protected _searchFields: string[] = []
    protected _populateFields:  string[] | PopulateOptions[] = []
    protected _lean: boolean = true

    assertId(id: string): void {
        if(!mongoose.Types.ObjectId.isValid(id)){
            console.log(`Invalid ID: ${id} is not a valid ObjectId.`)
            throw new InvalidIdError(id)
        }
    }


    async create(data: C): Promise<T> {
        try {
            const item: mongoose.HydratedDocument<T> = await this._model.create(data)

            if(this._populateFields && this._populateFields.length > 0){
                //@ts-ignore
                await item.populate(this._populateFields)
            }
            return this._lean ? item : item.toObject()
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                throw MongooseValidationErrorToValidationError(e)
            }
            if (e instanceof mongoose.Error.CastError) {
                throw MongooseCastErrorToValidationError(e)
            }
            if(e instanceof MongoServerError || e.name === 'MongoServerError'){
                throw MongoServerErrorToValidationError(e)
            }
            throw e
        }
    }

    async update(id: string, data: U): Promise<T> {

        this.assertId(id)

        try {
            const item: mongoose.HydratedDocument<T> = await this._model.findOneAndUpdate({_id: id}, data, {new: true}).populate(this._populateFields).exec()

            return this._lean ? item : item.toObject()
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                throw MongooseValidationErrorToValidationError(e)
            }
            if (e instanceof mongoose.Error.CastError) {
                throw MongooseCastErrorToValidationError(e)
            }
            if(e instanceof MongoServerError || e.name === 'MongoServerError'){
                throw MongoServerErrorToValidationError(e)
            }
            throw e
        }
    }

    async updatePartial(id: string, data: any): Promise<T> {

        this.assertId(id)

        try {

            const item: mongoose.HydratedDocument<T> = await this._model.findOneAndUpdate({_id: id}, data, {new: true}).populate(this._populateFields).exec()
            return this._lean ? item : item.toObject()
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                throw MongooseValidationErrorToValidationError(e)
            }
            if (e instanceof mongoose.Error.CastError) {
                throw MongooseCastErrorToValidationError(e)
            }
            if(e instanceof MongoServerError || e.name === 'MongoServerError'){
                throw MongoServerErrorToValidationError(e)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        this.assertId(id)
        const result: DeleteResult = await this._model.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }

    async findById(id: string): Promise<T | null> {

        const item = await this._model
            .findById(id)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()

        return item as T;
    }

    async findByIds(ids: Array<string>): Promise<T[]> {

        const items = await this._model
            .find({_id: {$in: ids}})
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()


        return items as T[]
    }

    async findOneBy(field: string, value: any): Promise<T | null> {
        const filter: any = {[field]: value}

        const item = await this._model
            .findOne(filter)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()


        return item as T
    }

    async findBy(field: string, value: any, limit: number  = 0): Promise<T[]> {
        const filter: any = {[field]: value}
        const items = await this._model
            .find(filter)
            .limit(limit)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()


        return items as T[]
    }

    async fetchAll(): Promise<T[]> {

        const items = await this._model
            .find()
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()


        return items as T[]
    }

    async search(value: string, limit: number = 1000, filters: IDraxFieldFilter[] =[]): Promise<T[]> {

        const query = {}

        if(mongoose.Types.ObjectId.isValid(value)) {
            query['_id'] = new mongoose.Types.ObjectId(value)
        }else if (value) {
            query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(value.toString(), 'i')}))
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const items = await this._model
            .find(query)
            .limit(limit)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()


        return items as T[]
    }


    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = "asc",
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>> {

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
        const populate = this._populateFields
        const lean = this._lean
        const options = {page, limit, sort, populate, lean} as PaginateOptions
        const items: PaginateResult<T> = await this._model.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: items.totalDocs,
            items: items.docs
        }
    }

    async findOne({
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<T> {

        const query = {}

        if(search){
            if(mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            }else{
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const item =  this._model
            .findOne(query)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()

        return item as T
    }

    async find({
                   limit = 0,
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<T[]> {

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
        const items =  await this._model
            .find(query)
            .limit(limit)
            .sort(sort)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()


        return items as T[]
    }

    async findCursor({
                         limit = 0,
                         orderBy = '',
                         order = false,
                         search = '',
                         filters = []
                     }: IDraxFindOptions): Promise<Cursor<T>> {

        const query = {}

        if (search) {
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)

        return this._model.find(query).limit(limit).sort(sort).cursor() as Cursor<T>;
    }
}

export default AbstractMongoRepository
export {AbstractMongoRepository}
