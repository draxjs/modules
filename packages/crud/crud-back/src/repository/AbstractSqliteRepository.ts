import sqlite from "better-sqlite3";
import type {IDraxCrud, IDraxFindOptions, IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {randomUUID} from "node:crypto";
import {
    SqlSort, SqlQueryFilter, SqliteTableBuilder, SqliteTableField,
    SqliteErrorToValidationError
} from "@drax/common-back";


class AbstractSqliteRepository<T, C, U> implements IDraxCrud<T, C, U> {
    protected db: any;
    protected dataBaseFile: string;
    protected tableName: string = '';
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
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
            if(item[field] != undefined){
                item[field] = item[field] === 1 || item[field] === 'true'
            }

        }
    }

    async decorate(item: any) {
        await this.execPopulate(item)
        this.castToBoolean(item)
        await this.prepareItem(item)
    }

    async create(data: any): Promise<T> {
        try {

            if (!data[this.identifier]) {
                data[this.identifier] = randomUUID()
            }

            for (const key in data) {
                if (typeof data[key] === 'boolean') {
                    data[key] = data[key] ? 1 : 0
                }
            }

            if (this.hasCreatedAt()) {
                data.createdAt = (new Date().toISOString())
            }

            if (this.hasUpdatedAt()) {
                data.updatedAt = (new Date().toISOString())
            }

            await this.prepareData(data)

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
            console.log(e)
            throw SqliteErrorToValidationError(e, data)
        }
    }

    async updatePartial(id: string, data: any): Promise<T> {
        return await this.update(id, data)
    }


    async update(id: string, data: any): Promise<T> {
        try {

            for (const key in data) {
                if (typeof data[key] === 'boolean') {
                    data[key] = data[key] ? 1 : 0
                }
            }

            if (this.hasUpdatedAt()) {
                data.updatedAt = (new Date().toISOString())
            }

            await this.prepareData(data)

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
            console.log(e)
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
        if (search && this.searchFields.length > 0) {
            where = ` WHERE ${this.searchFields.map(field => `${field} LIKE '%${search}%'`).join(" OR ")}`
        }

        if (filters.length > 0) {
            where = SqlQueryFilter.applyFilters(where, filters)
        }

        const sort = SqlSort.applySort(orderBy, order)

        const rCount = this.db.prepare(`SELECT COUNT(*) as count
                                        FROM ${this.tableName} ${where}`).get();
        const items = this.db.prepare(`SELECT *
                                       FROM ${this.tableName} ${where} ${sort} LIMIT ?
                                       OFFSET ? `).all([limit, offset]) as T[];

        for (const item of items) {
            await this.decorate(item)
        }

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: items
        }
    }

    async find({
                   limit = 5,
                   orderBy = '',
                   order = 'desc',
                   search = '',
                   filters = []
               }: IDraxFindOptions): Promise<any[]> {


        let where = ""
        if (search && this.searchFields.length > 0) {
            where = ` WHERE ${this.searchFields.map(field => `${field} LIKE '%${search}%'`).join(" OR ")}`
        }

        if (filters.length > 0) {
            where = SqlQueryFilter.applyFilters(where, filters)
        }

        const sort = SqlSort.applySort(orderBy, order)

        const rCount = this.db.prepare(`SELECT COUNT(*) as count
                                        FROM ${this.tableName} ${where}`).get();
        const items = this.db.prepare(`SELECT *
                                       FROM ${this.tableName} ${where} ${sort} LIMIT ? `).all([limit]) as T[];

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

    async search(value: any, limit: number = 1000): Promise<any[]> {
        let where = ""
        if (value && this.searchFields.length > 0) {
            where = ` WHERE ${this.searchFields.map(field => `${field} LIKE '%${value}%'`).join(" OR ")}`
        }
        const items = this.db.prepare(`SELECT *
                                       FROM ${this.tableName} ${where} LIMIT ${limit}`).all();

        for (const item of items) {
            await this.decorate(item)
        }

        return items
    }

    async findById(id: string): Promise<T | null> {
        const item = this.db.prepare(`SELECT *
                                      FROM ${this.tableName}
                                      WHERE ${this.identifier} = ?`).get(id);
        await this.decorate(item)
        return item
    }

    async findBy(field: string, value: any, limit: number = 0): Promise<T[] | null> {
        const items = this.db.prepare(`SELECT *
                                       FROM ${this.tableName}
                                       WHERE ${field} = ? LIMIT ${limit}`).all(value);
        for (const item of items) {
            await this.decorate(item)
        }
        return items
    }

    async findOneBy(field: string, value: any): Promise<T | null> {
        const item = this.db.prepare(`SELECT *
                                      FROM ${this.tableName}
                                      WHERE ${field} = ?`).get(value);
        await this.decorate(item)
        return item
    }
}

export default AbstractSqliteRepository
