
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
import type {
    IDraxPaginateOptions,
    IDraxPaginateResult,
    IDraxFindOptions,
    IDraxCrud,
    IDraxFieldFilter,
    IDraxGroupByOptions
} from "@drax/crud-share";
import type {PaginateModel, PaginateOptions, PaginateResult} from "mongoose";
import {InvalidIdError} from "@drax/common-back";
import {MongoServerError} from "mongodb";


class AbstractMongoRepository<T, C, U> implements IDraxCrud<T, C, U> {

    protected _model: mongoose.Model<T> & PaginateModel<T>
    protected _searchFields: string[] = []
    protected _populateFields: string[] | PopulateOptions[] = []
    protected _lean: boolean = true

    assertId(id: string): void {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`Invalid ID: ${id} is not a valid ObjectId.`)
            throw new InvalidIdError(id)
        }
    }


    async create(data: C): Promise<T> {
        try {
            const item: mongoose.HydratedDocument<T> = await this._model.create(data)

            if (this._populateFields && this._populateFields.length > 0) {
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
            if (e instanceof MongoServerError || e.name === 'MongoServerError') {
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
            if (e instanceof MongoServerError || e.name === 'MongoServerError') {
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
            if (e instanceof MongoServerError || e.name === 'MongoServerError') {
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
        this.assertId(id)
        const item = await this._model
            .findById(id)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()

        return item as T;
    }

    async findByIds(ids: Array<string>): Promise<T[]> {

        ids.map(id => this.assertId(id))

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

    async findBy(field: string, value: any, limit: number = 0): Promise<T[]> {
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

    async search(value: string, limit: number = 1000, filters: IDraxFieldFilter[] = []): Promise<T[]> {

        const query = {}

        if (mongoose.Types.ObjectId.isValid(value)) {
            query['_id'] = new mongoose.Types.ObjectId(value)
        } else if (value) {
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

        if (search) {
            if (mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            } else {
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

        if (search) {
            if (mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            } else {
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const item = this._model
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

        if (search) {
            if (mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            } else {
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(search.toString(), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters)

        const sort = MongooseSort.applySort(orderBy, order)
        const items = await this._model
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

    async groupBy({fields = [], filters = [], dateFormat = 'day'}: IDraxGroupByOptions): Promise<Array<any>> {

        const query = {}

        MongooseQueryFilter.applyFilters(query, filters)

        // Obtener el schema para identificar campos de referencia y fechas
        const schema = this._model.schema

        // Construir el objeto de agrupación dinámicamente
        const groupId: any = {}
        const lookupStages: any[] = []
        const finalProjectFields: any = {count: 1, _id: 0}
        const refFields = new Set<string>()
        const dateFields = new Set<string>()

        // Función para obtener el formato de fecha según el nivel de granularidad
        const getDateFormat = (field: string, format: string) => {
            const formats = {
                'year': {
                    $dateFromParts: {
                        year: {$year: `$${field}`},
                        month: 1,
                        day: 1
                    }
                },
                'month': {
                    $dateFromParts: {
                        year: {$year: `$${field}`},
                        month: {$month: `$${field}`},
                        day: 1
                    }
                },
                'day': {
                    $dateFromParts: {
                        year: {$year: `$${field}`},
                        month: {$month: `$${field}`},
                        day: {$dayOfMonth: `$${field}`}
                    }
                },
                'hour': {
                    $dateFromParts: {
                        year: {$year: `$${field}`},
                        month: {$month: `$${field}`},
                        day: {$dayOfMonth: `$${field}`},
                        hour: {$hour: `$${field}`}
                    }
                },
                'minute': {
                    $dateFromParts: {
                        year: {$year: `$${field}`},
                        month: {$month: `$${field}`},
                        day: {$dayOfMonth: `$${field}`},
                        hour: {$hour: `$${field}`},
                        minute: {$minute: `$${field}`}
                    }
                },
                'second': {
                    $dateFromParts: {
                        year: {$year: `$${field}`},
                        month: {$month: `$${field}`},
                        day: {$dayOfMonth: `$${field}`},
                        hour: {$hour: `$${field}`},
                        minute: {$minute: `$${field}`},
                        second: {$second: `$${field}`}
                    }
                }
            }
            return formats[format] || formats['day']
        }

        fields.forEach(field => {
            const schemaPath = schema.path(field)

            // Verificar si el campo es de tipo Date
            if (schemaPath && schemaPath.instance === 'Date') {
                dateFields.add(field)
                groupId[field] = getDateFormat(field, dateFormat)
            }
            // Verificar si el campo es una referencia
            else if (schemaPath && schemaPath.options && schemaPath.options.ref) {
                const refModel = schemaPath.options.ref
                const fieldName = field

                refFields.add(field)

                // Obtener el modelo referenciado y su nombre de colección real
                const refModelInstance = mongoose.model(refModel)
                const collectionName = refModelInstance.collection.name

                // Determinar el campo local correcto según si es un solo campo o múltiples
                const localField = fields.length === 1 ? '_id' : `_id.${fieldName}`

                lookupStages.push({
                    $lookup: {
                        from: collectionName,
                        localField: localField,
                        foreignField: '_id',
                        as: `${fieldName}_populated`
                    }
                })

                // Unwind para convertir el array en objeto único
                lookupStages.push({
                    $unwind: {
                        path: `$${fieldName}_populated`,
                        preserveNullAndEmptyArrays: true
                    }
                })

                // En la proyección final, usar el objeto poblado
                finalProjectFields[field] = `$${fieldName}_populated`
                groupId[field] = `$${field}`
            } else {
                // Si no es una referencia ni fecha, usar el valor directo
                groupId[field] = `$${field}`
            }
        })

        // Construir la proyección final para campos de fecha
        fields.forEach(field => {
            if (dateFields.has(field)) {
                if (fields.length === 1) {
                    finalProjectFields[field] = `$_id`
                } else {
                    finalProjectFields[field] = `$_id.${field}`
                }
            } else if (!refFields.has(field)) {
                if (fields.length === 1) {
                    finalProjectFields[field] = `$_id`
                } else {
                    finalProjectFields[field] = `$_id.${field}`
                }
            }
        })

        const pipeline: any[] = [
            {$match: query},
            {
                $group: {
                    _id: fields.length === 1 ? (dateFields.has(fields[0]) ? getDateFormat(fields[0], dateFormat) : `$${fields[0]}`) : groupId,
                    count: {$sum: 1}
                }
            }
        ]

        // Solo agregar lookups si hay campos de referencia
        if (lookupStages.length > 0) {
            pipeline.push(...lookupStages)
        }

        pipeline.push(
            {
                $project: finalProjectFields
            },
            {$sort: {count: -1}}
        )
        console.log("pipeline", JSON.stringify(pipeline, null, 2))
        const result = await this._model.aggregate(pipeline).exec()
        return result
    }
}

export default AbstractMongoRepository
export {AbstractMongoRepository}
