
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

    private getNestedValue(source: any, path: string): any {
        return path.split('.').reduce((value, key) => value == null ? undefined : value[key], source)
    }

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

    async findByIds(ids: Array<string>, filters: IDraxFieldFilter[] = []): Promise<T[]> {

        ids.map(id => this.assertId(id))

        const query: any = {_id: {$in: ids}}

        MongooseQueryFilter.applyFilters(query, filters, this._model)

        const items = await this._model
            .find(query)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()


        return items as T[]
    }

    async findOneBy(field: string, value: any, filters: IDraxFieldFilter[] = []): Promise<T | null> {
        const query: any = {[field]: value}

        MongooseQueryFilter.applyFilters(query, filters, this._model)

        const item = await this._model
            .findOne(query)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()


        return item as T
    }

    async findBy(field: string, value: any, limit: number = 0, filters: IDraxFieldFilter[] = []): Promise<T[]> {
        const query: any = {[field]: value}

        MongooseQueryFilter.applyFilters(query, filters, this._model)

        const items = await this._model
            .find(query)
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

        MongooseQueryFilter.applyFilters(query, filters, this._model)

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

        MongooseQueryFilter.applyFilters(query, filters, this._model)

       // console.log("Paginate Query", query)

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

        MongooseQueryFilter.applyFilters(query, filters, this._model)

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

        MongooseQueryFilter.applyFilters(query, filters, this._model)

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

        MongooseQueryFilter.applyFilters(query, filters, this._model)

        const sort = MongooseSort.applySort(orderBy, order,)

        return this._model.find(query).limit(limit).sort(sort).cursor() as Cursor<T>;
    }

    async groupBy({fields = [], filters = [], dateFormat = 'day'}: IDraxGroupByOptions): Promise<Array<any>> {

        const query = {}

        MongooseQueryFilter.applyFilters(query, filters, this._model)
          // console.log("groupBy Query", query)

        // Obtener el schema para identificar campos de referencia y fechas
        const schema = this._model.schema

        // Construir el objeto de agrupación dinámicamente
        const groupId: any = {}
        const preGroupStages: any[] = []
        const postGroupStages: any[] = []
        const finalProjectFields: any = {count: 1, _id: 0}
        const refFields = new Set<string>()
        const dateFields = new Set<string>()
        const numericFields = new Set<string>()
        const groupFields: string[] = []
        const groupFieldAliases = new Map<string, string>()
        const preGroupLookupAliases = new Map<string, string>()
        const numericInstances = new Set(['Number', 'Decimal128', 'Double', 'Int32', 'Long', 'BigInt'])
        const totalGroupFields = fields.filter(field => {
            const schemaPath = schema.path(field)
            return !(schemaPath && numericInstances.has(schemaPath.instance))
        }).length

        const getGroupFieldAlias = (field: string): string => {
            const existingAlias = groupFieldAliases.get(field)
            if (existingAlias) {
                return existingAlias
            }

            const newAlias = `field_${groupFieldAliases.size}`
            groupFieldAliases.set(field, newAlias)
            return newAlias
        }

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

        const ensureLookupForReferencedField = (field: string, refModel: string): string => {
            const existingAlias = preGroupLookupAliases.get(field)
            if (existingAlias) {
                return existingAlias
            }

            const refModelInstance = mongoose.model(refModel)
            const collectionName = refModelInstance.collection.name
            const lookupAlias = `${field}_groupByRef`

            preGroupStages.push({
                $lookup: {
                    from: collectionName,
                    localField: field,
                    foreignField: '_id',
                    as: lookupAlias
                }
            })

            preGroupStages.push({
                $unwind: {
                    path: `$${lookupAlias}`,
                    preserveNullAndEmptyArrays: true
                }
            })

            preGroupLookupAliases.set(field, lookupAlias)
            return lookupAlias
        }

        fields.forEach(field => {
            const schemaPath = schema.path(field)
            const fieldAlias = getGroupFieldAlias(field)
            const fieldParts = field.split('.')
            const rootField = fieldParts[0]
            const nestedFieldPath = fieldParts.slice(1).join('.')
            const rootSchemaPath = rootField === field ? schemaPath : schema.path(rootField)

            // Verificar si el campo es numérico: se agregará con $sum y no formará parte de la clave de agrupación
            if (schemaPath && numericInstances.has(schemaPath.instance)) {
                numericFields.add(field)
                finalProjectFields[field] = 1
                return
            }

            groupFields.push(field)

            // Verificar si el campo es de tipo Date
            if (schemaPath && schemaPath.instance === 'Date') {
                dateFields.add(field)
                groupId[fieldAlias] = getDateFormat(field, dateFormat)
            }
            // Verificar si el campo es una referencia
            else if (schemaPath && schemaPath.options && schemaPath.options.ref) {
                const refModel = schemaPath.options.ref

                refFields.add(field)

                // Obtener el modelo referenciado y su nombre de colección real
                const refModelInstance = mongoose.model(refModel)
                const collectionName = refModelInstance.collection.name

                // Determinar el campo local correcto según si es un solo campo o múltiples
                const localField = totalGroupFields === 1 ? '_id' : `_id.${fieldAlias}`

                postGroupStages.push({
                    $lookup: {
                        from: collectionName,
                        localField: localField,
                        foreignField: '_id',
                        as: `${fieldAlias}_populated`
                    }
                })

                // Unwind para convertir el array en objeto único
                postGroupStages.push({
                    $unwind: {
                        path: `$${fieldAlias}_populated`,
                        preserveNullAndEmptyArrays: true
                    }
                })

                // En la proyección final, usar el objeto poblado
                finalProjectFields[field] = `$${fieldAlias}_populated`
                groupId[fieldAlias] = `$${field}`
            } else if (nestedFieldPath && rootSchemaPath && rootSchemaPath.options && rootSchemaPath.options.ref) {
                const lookupAlias = ensureLookupForReferencedField(rootField, rootSchemaPath.options.ref)
                groupId[fieldAlias] = `$${lookupAlias}.${nestedFieldPath}`
            } else {
                // Si no es una referencia ni fecha, usar el valor directo
                groupId[fieldAlias] = `$${field}`
            }
        })

        // Construir la proyección final para campos de fecha
        groupFields.forEach(field => {
            const fieldAlias = groupFieldAliases.get(field) as string
            if (dateFields.has(field)) {
                if (groupFields.length === 1) {
                    finalProjectFields[field] = `$_id`
                } else {
                    finalProjectFields[field] = `$_id.${fieldAlias}`
                }
            } else if (!refFields.has(field)) {
                if (groupFields.length === 1) {
                    finalProjectFields[field] = `$_id`
                } else {
                    finalProjectFields[field] = `$_id.${fieldAlias}`
                }
            }
        })

        const groupStage: any = {
            _id: null,
            count: {$sum: 1}
        }

        numericFields.forEach(field => {
            groupStage[field] = {$sum: {$ifNull: [`$${field}`, 0]}}
        })

        if (groupFields.length === 1) {
            const field = groupFields[0]
            const fieldAlias = groupFieldAliases.get(field) as string
            groupStage._id = dateFields.has(field) ? getDateFormat(field, dateFormat) : groupId[fieldAlias]
        } else if (groupFields.length > 1) {
            groupStage._id = groupId
        }

        const pipeline: any[] = [
            {$match: query},
            ...preGroupStages,
            {
                $group: groupStage
            }
        ]

        // Solo agregar lookups si hay campos de referencia
        if (postGroupStages.length > 0) {
            pipeline.push(...postGroupStages)
        }

        pipeline.push(
            {
                $project: finalProjectFields
            },
            {$sort: {count: -1}}
        )
        // console.log("pipeline", JSON.stringify(pipeline, null, 2))
        const result = await this._model.aggregate(pipeline).exec()

        return result.map((item: any) => {
            const normalizedItem = {...item}

            groupFields.forEach(field => {
                if (!field.includes('.') || normalizedItem[field] !== undefined) {
                    return
                }

                const nestedValue = this.getNestedValue(normalizedItem, field)
                if (nestedValue !== undefined) {
                    normalizedItem[field] = nestedValue
                }
            })

            return normalizedItem
        })
    }
}

export default AbstractMongoRepository
export {AbstractMongoRepository}
