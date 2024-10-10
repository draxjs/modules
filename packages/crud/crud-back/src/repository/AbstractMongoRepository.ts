import "mongoose-paginate-v2";
import mongoose from "mongoose";
import {MongooseQueryFilter, MongooseSort, MongooseErrorToValidationError} from "@drax/common-back";
import type {DeleteResult} from "mongodb";
import type {IDraxPaginateOptions, IDraxPaginateResult, IDraxFindOptions, IDraxCrud} from "@drax/crud-share";
import type {PaginateModel, PaginateOptions, PaginateResult} from "mongoose";


class AbstractMongoRepository<T, C, U> implements IDraxCrud<T, C, U> {

    _model: mongoose.Model<T> & PaginateModel<T>
    _searchFields: string[] = []
    _populateFields: string[] = []


    async create(data: C): Promise<T> {
        try {
            const item: mongoose.HydratedDocument<T> = new this._model(data)
            await item.save()

            //@ts-ignore
            await item.populate(this._populateFields)

            return item
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                throw MongooseErrorToValidationError(e)
            }
            throw e
        }
    }

    async update(id: string, data: U): Promise<T> {
        try {
            const item: mongoose.HydratedDocument<T> = await this._model.findOneAndUpdate({_id: id}, data, {new: true}).populate(this._populateFields).exec()
            return item
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                throw MongooseErrorToValidationError(e)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        const result: DeleteResult = await this._model.deleteOne({_id: id}).exec()
        return result.deletedCount == 1
    }

    async findById(id: string): Promise<T | null> {
        const item: mongoose.HydratedDocument<T> | null = await this._model.findById(id).populate(this._populateFields).exec()
        return item
    }

    async findByIds(ids: Array<string>): Promise<T[]> {
        const items: mongoose.HydratedDocument<T>[] = await this._model.find({_id: {$in: ids}}).populate(this._populateFields).exec()
        return items
    }

    async findOneBy(field: string, value: any): Promise<T | null> {
        const filter: any = {[field]: value}
        const item: mongoose.HydratedDocument<T> | null = await this._model.findOne(filter).populate(this._populateFields).exec()
        return item
    }

    async findBy(field: string, value: any): Promise<T[]> {
        const filter: any = {[field]: value}
        const items: mongoose.HydratedDocument<T>[] = await this._model.find(filter).populate(this._populateFields).exec()
        return items
    }

    async fetchAll(): Promise<T[]> {
        const items: mongoose.HydratedDocument<T>[] = await this._model.find().populate(this._populateFields).exec()
        return items
    }

    async search(value: string, limit: number = 1000): Promise<T[]> {
        const query = {}
        if (value) {
            query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(value.toString(), 'i')}))
        }
        const items: mongoose.HydratedDocument<T>[] = await this._model.find(query).limit(limit).exec()
        return items
    }


    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>> {

        const query = {}

        if (search) {
            query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search, 'i')}))
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)
        const populate = this._populateFields
        const options = {page, limit, sort, populate} as PaginateOptions
        const items: PaginateResult<T> = await this._model.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: items.totalDocs,
            items: items.docs
        }
    }

    async find({
                   cursor = false,
                   limit = 0,
                   orderBy = '',
                   order = false,
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<T[]> {

        const query = {}

        if (search) {
            query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search, 'i')}))
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)
        const populate = this._populateFields
        const items: T[] = await this._model.find(query).sort(sort).populate(populate)
        return items
    }
}

export default AbstractMongoRepository
export {AbstractMongoRepository}
