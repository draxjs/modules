import sqlite from "better-sqlite3";
import type {
    IDraxCrud, IDraxFieldFilter,
    IDraxFindOptions,
    IDraxGroupByOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";
import {randomUUID} from "node:crypto";
import {
    SqlSort,
    SqlQueryFilter,
    SqliteTableBuilder,
    SqliteTableField,
    SqliteErrorToValidationError
} from "@drax/common-back";



class AbstractSqliteRepository<T, C, U> implements IDraxCrud<T, C, U> {
    protected db: any;
    protected dataBaseFile: string;
    protected tableName: string = '';
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields: { field: string, table: string, identifier: string }[]
    protected tableFields: SqliteTableField[];
    protected verbose: boolean;

    constructor(dataBaseFile: string, verbose: boolean = false) {
        if (!dataBaseFile) {
            throw new Error("dataBaseFile is required")
        }

        this.dataBaseFile = dataBaseFile;
        this.verbose = verbose;
        this.db = new sqlite(dataBaseFile, {verbose: verbose ? console.log : null});
    }

    build() {
        const builder = new SqliteTableBuilder(this.dataBaseFile, this.tableName, this.tableFields, this.verbose);
        builder.build(this.identifier)
    }

    hasCreatedAt() {
        return this.tableFields.some(field => field.name === 'createdAt')
    }

    hasUpdatedAt() {
        return this.tableFields.some(field => field.name === 'updatedAt')
    }

    async prepareData(data: any){
        return data
    }

    async prepareItem(item: any) {
        return item
    }

    protected parseJsonValue(value: any): any {
        if (typeof value !== 'string') {
            return value
        }

        try {
            return JSON.parse(value)
        } catch {
            return value
        }
    }

    protected normalizeSqliteValue(value: any): any {
        if (value === undefined) {
            return null
        }

        if (value === null) {
            return null
        }

        if (typeof value === 'boolean') {
            return value ? 1 : 0
        }

        if (typeof value === 'number' || typeof value === 'string' || typeof value === 'bigint') {
            return value
        }

        if (Buffer.isBuffer(value)) {
            return value
        }

        if (value instanceof Date) {
            return value.toISOString()
        }

        if (value instanceof ArrayBuffer) {
            return Buffer.from(value)
        }

        if (ArrayBuffer.isView(value)) {
            return Buffer.from(value.buffer, value.byteOffset, value.byteLength)
        }

        if (typeof value === 'object') {
            return JSON.stringify(value)
        }

        return String(value)
    }

    protected normalizeSqliteData(data: any): any {
        if (!data || typeof data !== 'object') {
            return data
        }

        for (const key of Object.keys(data)) {
            data[key] = this.normalizeSqliteValue(data[key])
        }

        return data
    }

    protected deserializeSqliteData(item: any): any {
        if (!item || typeof item !== 'object') {
            return item
        }

        for (const field of this.jsonFields) {
            if (Object.prototype.hasOwnProperty.call(item, field)) {
                item[field] = this.parseJsonValue(item[field])
            }
        }

        return item
    }

    async execPopulate(item: any) {
        for (const field of this.populateFields) {
            if (item[field.field]) {
                item[field.field] = this.db.prepare(`SELECT *
                                                     FROM ${field.table}
                                                     WHERE ${field.identifier} = ?`).get(item[field.field]);
            }
        }
        return item
    }

    castToBoolean(item: any) {
        for (const field of this.booleanFields) {
            if(item && item[field] != undefined){
                item[field] = item[field] === 1 || item[field] === 'true'
            }

        }
    }

    async decorate(item: any) {
        await this.execPopulate(item)
        this.deserializeSqliteData(item)
        this.castToBoolean(item)
        await this.prepareItem(item)
    }



    async create(data: any): Promise<T> {
        try {

            if (!data[this.identifier]) {
                data[this.identifier] = randomUUID()
            }

            if (this.hasCreatedAt()) {
                data.createdAt = (new Date().toISOString())
            }

            if (this.hasUpdatedAt()) {
                data.updatedAt = (new Date().toISOString())
            }



            await this.prepareData(data)
            this.normalizeSqliteData(data)

            const fields = Object.keys(data)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(data)
                .map(field => `@${field}`)
                .join(', ');

            const stmt = this.db.prepare(`INSERT INTO ${this.tableName} (${fields})
                                          VALUES (${values})`);
            stmt.run(data)

            const item = await this.findById(data[this.identifier])
            return item

        } catch (e) {
            console.error("sqlite create",e)
            throw SqliteErrorToValidationError(e, data)
        }
    }

    async updatePartial(id: string, data: any): Promise<T> {
        return await this.update(id, data)
    }


    async update(id: string, data: any): Promise<T> {
        try {

            if (this.hasUpdatedAt()) {
                data.updatedAt = (new Date().toISOString())
            }

            await this.prepareData(data)
            this.normalizeSqliteData(data)

            const setClauses = Object.keys(data)
                .map(field => `${field} = @${field}`)
                .join(', ');

            data.identifier = id

            const stmt = this.db.prepare(`UPDATE ${this.tableName}
                                          SET ${setClauses}
                                          WHERE ${this.identifier} = @identifier `);
            stmt.run(data);
            const item = await this.findById(id)
            return item

        } catch (e) {
            console.error(e)
            throw SqliteErrorToValidationError(e, data)
        }

    }


    async delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare(`DELETE
                                      FROM ${this.tableName}
                                      WHERE ${this.identifier} = ?`);
        stmt.run(id);
        return true
    }

    async deleteAll(): Promise<boolean> {
        const stmt = this.db.prepare(`DELETE
                                      FROM ${this.tableName}`);
        stmt.run();
        return true
    }


    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = 'desc',
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>> {

        const offset = page > 1 ? (page - 1) * limit : 0

        let where = ""
        let params: any[] = []

        // SEARCH
        if (search && this.searchFields.length > 0) {

            const searchConditions = this.searchFields
                .map(field => `${field} LIKE ?`)
                .join(" OR ")

            where = ` WHERE (${searchConditions})`

            params.push(...this.searchFields.map(() => `%${search}%`))
        }

        // FILTERS
        if (filters.length > 0) {

            const result = SqlQueryFilter.applyFilters(where, filters)

            where = result.where
            params.push(...result.params)
        }

        const sort = SqlSort.applySort(orderBy, order)

        // COUNT
        const rCount = this.db
            .prepare(`SELECT COUNT(*) as count FROM ${this.tableName} ${where}`)
            .get(params)

        // DATA
        const items = this.db
            .prepare(`SELECT * FROM ${this.tableName} ${where} ${sort} LIMIT ? OFFSET ?`)
            .all([...params, limit, offset]) as T[]

        for (const item of items) {
            await this.decorate(item)
        }

        const pagination = {
            page,
            limit,
            total: rCount.count,
            items
        }
        console.log('Pagination result:', JSON.stringify(pagination,null,4))
        return pagination
    }

    async find({
                   limit = 5,
                   orderBy = '',
                   order = 'desc',
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<T[]> {

        let where = ""
        let params: any[] = []

        // SEARCH
        if (search && this.searchFields.length > 0) {

            const searchConditions = this.searchFields
                .map(field => `${field} LIKE ?`)
                .join(" OR ")

            where = ` WHERE (${searchConditions})`

            params.push(...this.searchFields.map(() => `%${search}%`))
        }

        // FILTERS
        if (filters.length > 0) {

            const result = SqlQueryFilter.applyFilters(where, filters)

            where = result.where
            params.push(...result.params)
        }

        const sort = SqlSort.applySort(orderBy, order)

        const items = this.db
            .prepare(`SELECT * FROM ${this.tableName} ${where} ${sort} LIMIT ?`)
            .all([...params, limit]) as T[]

        for (const item of items) {
            await this.decorate(item)
        }

        return items
    }

    async fetchAll(): Promise<any[]> {
        const items = this.db.prepare(`SELECT *
                                       FROM ${this.tableName}`).all();
        for (const item of items) {
            await this.decorate(item)
        }
        return items
    }

    async search(value: any, limit: number = 1000, filters: IDraxFieldFilter[] = []): Promise<T[]> {

        let where = ""
        let params: any[] = []

        if (value && this.searchFields.length > 0) {

            const searchConditions = this.searchFields
                .map(field => `${field} LIKE ?`)
                .join(" OR ")

            where = ` WHERE (${searchConditions})`

            params.push(...this.searchFields.map(() => `%${value}%`))
        }

        const items = this.db
            .prepare(`SELECT * FROM ${this.tableName} ${where} LIMIT ?`)
            .all([...params, limit]) as T[]

        for (const item of items) {
            await this.decorate(item)
        }

        return items
    }

    async findById(id: string): Promise<T | null> {
        if (id === undefined || id === null) {
            return null
        }

        const item = this.db.prepare(`SELECT *
                                      FROM ${this.tableName}
                                      WHERE ${this.identifier} = ?`).get(id);
        await this.decorate(item)
        return item
    }

    async findByIds(ids: string[], filters: IDraxFieldFilter[] = []): Promise<T[] | null> {

        const inPlaceholders = ids.map(() => '?').join(',')

        let where = `WHERE ID IN(${inPlaceholders})`
        let params: any[] = [ids]

        if (filters.length > 0) {
            const result = SqlQueryFilter.applyFilters(where, filters)
            where = result.where
            params.push(...result.params)
        }

        const items = this.db
            .prepare(`SELECT * FROM ${this.tableName} ${where}`)
            .all(params) as T[]

        for (const item of items) {
            await this.decorate(item)
        }

        return items

    }

    async findBy(field: string, value: any, limit: number = 0, filters: IDraxFieldFilter[] = []): Promise<T[] | null> {

        let where = `WHERE ${field} = ?`
        let params: any[] = [value]

        if (filters.length > 0) {
            const result = SqlQueryFilter.applyFilters(where, filters)
            where = result.where
            params.push(...result.params)
        }

        const items = this.db
            .prepare(`SELECT * FROM ${this.tableName} ${where}  LIMIT ?`)
            .all([...params, limit]) as T[]

        for (const item of items) {
            await this.decorate(item)
        }

        return items

    }

    async findOneBy(field: string, value: any, filters: IDraxFieldFilter[] = []): Promise<T | null> {

        let where = `WHERE ${field} = ?`
        let params: any[] = [value]

        if (filters.length > 0) {
            const result = SqlQueryFilter.applyFilters(where, filters)
            where = result.where
            params.push(...result.params)
        }

        const item = this.db
            .prepare(`SELECT * FROM ${this.tableName} ${where} LIMIT 1`)
            .get(params) as T

        await this.decorate(item)

        return item

    }

    async findOne({
                      search = '',
                      filters = []
                  }: IDraxFindOptions): Promise<T> {

        let where = ""
        let params: any[] = []

        // SEARCH
        if (search && this.searchFields.length > 0) {

            const searchConditions = this.searchFields
                .map(field => `${field} LIKE ?`)
                .join(" OR ")

            where = ` WHERE (${searchConditions})`

            params.push(...this.searchFields.map(() => `%${search}%`))
        }

        // FILTERS
        if (filters.length > 0) {

            const result = SqlQueryFilter.applyFilters(where, filters)

            where = result.where
            params.push(...result.params)
        }

        const item = this.db
            .prepare(`SELECT * FROM ${this.tableName} ${where} LIMIT 1`)
            .get(params)

        if (item) {
            await this.decorate(item)
        }

        return item as T
    }

    async groupBy({fields = [], filters = [], dateFormat = 'day'}: IDraxGroupByOptions): Promise<Array<any>> {

        if (fields.length === 0) {
            throw new Error("At least one field is required for groupBy")
        }

        let where = ""
        let params: any[] = []

        if (filters.length > 0) {
            const result = SqlQueryFilter.applyFilters(where, filters)
            where = result.where
            params.push(...result.params)
        }

        const getDateFormatSQL = (field: string, format: string): string => {
            const formats: { [key: string]: string } = {
                'year': `strftime('%Y', ${field})`,
                'month': `strftime('%Y-%m', ${field})`,
                'day': `strftime('%Y-%m-%d', ${field})`,
                'hour': `strftime('%Y-%m-%d %H:00:00', ${field})`,
                'minute': `strftime('%Y-%m-%d %H:%M:00', ${field})`,
                'second': `strftime('%Y-%m-%d %H:%M:%S', ${field})`
            }
            return formats[format] || formats['day']
        }

        const isDateField = (field: string): boolean => {
            const tableField = this.tableFields.find(tf => tf.name === field)
            return tableField
                ? tableField.type === 'TEXT' && (field.includes('Date') || field.includes('date'))
                : false
        }

        const isNumericField = (field: string): boolean => {
            const tableField = this.tableFields.find(tf => tf.name === field)
            if (!tableField) return false
            const type = tableField.type.toUpperCase()
            return ['INTEGER', 'REAL', 'NUMERIC'].includes(type)
        }

        const selectParts: string[] = []
        const groupParts: string[] = []

        for (const field of fields) {

            const tableField = this.tableFields.find(tf => tf.name === field)

            if (!tableField) {
                throw new Error(`Invalid field ${field}`)
            }

            if (isNumericField(field)) {
                selectParts.push(`SUM(${field}) as ${field}`)
                continue
            }

            if (isDateField(field)) {
                const formatted = getDateFormatSQL(field, dateFormat)
                selectParts.push(`${formatted} as ${field}`)
                groupParts.push(formatted)
                continue
            }

            selectParts.push(field)
            groupParts.push(field)
        }

        const selectFields = selectParts.join(", ")
        const groupByFields = groupParts.join(", ")

        const query = `
        SELECT ${selectFields}, COUNT(*) as count
        FROM ${this.tableName}
        ${where}
        ${groupByFields ? `GROUP BY ${groupByFields}` : ''}
        ORDER BY count DESC
    `

        try {

            const result = this.db.prepare(query).all(params) as Array<any>

            // for (const item of result) {
            //     await this.decorate(item)
            // }

            return result

        } catch (e) {
            console.error("GroupBy query error:", e)
            throw e
        }
    }
}

export default AbstractSqliteRepository
