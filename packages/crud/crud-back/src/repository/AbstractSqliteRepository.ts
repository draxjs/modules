import sqlite from "better-sqlite3";
import type {IDraxCrud, IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {randomUUID} from "node:crypto";
import {
    SqlSort, SqlQueryFilter, SqliteTableBuilder, SqliteTableField,
    SqliteErrorToValidationError} from "@drax/common-back";



class AbstractSqliteRepository<T> implements IDraxCrud<T, T, T>{
    protected db: any;
    protected tableName: string;
    protected dataBase: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected identifier: string = 'id';
    protected verbose: boolean;
    protected tableFields: SqliteTableField[];

    constructor(dataBase:string, tableName: string, identifier:string = 'id',searchFields:string[] = [], booleanFields:string[] = [], verbose:boolean = false) {
        if(!dataBase){
            throw new Error("dataBase is required")
        }

        if(!tableName){
            throw new Error("tableName is required")
        }


        this.dataBase = dataBase;
        this.tableName =  tableName
        this.identifier =  identifier
        this.searchFields =  searchFields
        this.booleanFields =  booleanFields
        this.verbose = verbose;
        this.db = new sqlite(dataBase, {verbose: verbose ? console.log : null});
    }

    build() {
        const builder = new SqliteTableBuilder(this.dataBase, this.tableName, this.tableFields, this.verbose);
        builder.build(this.identifier)
    }

    async create(data: any): Promise<T> {
        try{

            if(!data[this.identifier]){
                data[this.identifier] = randomUUID()
            }

            for(const key in data){
                if(typeof data[key] === 'boolean'){
                    data[key] = data[key]? 1 : 0
                }
            }

            const fields = Object.keys(data)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(data)
                .map(field => `@${field}`)
                .join(', ');

            const stmt = this.db.prepare(`INSERT INTO ${this.tableName} (${fields}) VALUES (${values})`);
            stmt.run(data)
            return this.findById(data[this.identifier])
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, data)
        }
    }

    async findById(id: string): Promise<T | null>{
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${this.identifier} = ?`).get(id);
        return item
    }

    async findBy(field: string, value: any): Promise<T[] | null>{
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`).all(value);
        return item
    }

    async findOneBy(field: string, value: any): Promise<T | null>{
        const item = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`).get(value);
        return item
    }

    async update(id: string, data: any): Promise<T> {
        try{

            for(const key in data){
                if(typeof data[key] === 'boolean'){
                    data[key] = data[key]? 1 : 0
                }
            }

            const setClauses = Object.keys(data)
                .map(field => `${field} = @${field}`)
                .join(', ');
            data.identifier = id
            const stmt = this.db.prepare( `UPDATE ${this.tableName} SET ${setClauses} WHERE ${this.identifier} = @identifier `);
            stmt.run(data);
            return this.findById(id)
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, data)
        }

    }


    async delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE ${this.identifier} = ?`);
        stmt.run(id);
        return true
    }



    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       order= 'desc',
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<T>>{

        const offset = page > 1 ? (page - 1) * limit : 0

        let where=""
        if (search && this.searchFields.length > 0) {
            where = ` WHERE ${this.searchFields.map(field => `${field} LIKE '%${search}%'`).join(" OR ")}`
        }

        if (filters.length > 0) {
            where = SqlQueryFilter.applyFilters(where, filters)
        }

        const sort = SqlSort.applySort(orderBy, order)

        const rCount = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName} ${where}`).get();
        const items = this.db.prepare(`SELECT * FROM ${this.tableName} ${where} ${sort} LIMIT ? OFFSET ? `).all([limit, offset]) as T[];

        for(const item of items){
            for(const key in item) {
                if (this.booleanFields.includes(key)) {
                    //@ts-ignore
                    item[key] = item[key] ? true : false
                }
            }
        }

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: items
        }
    }

    async fetchAll(): Promise<any[]>{
        const items = this.db.prepare(`SELECT * FROM ${this.tableName}`).all();
        return items
    }

    async search(value: any, limit: number = 1000): Promise<any[]>{
        let where=""
        if (value && this.searchFields.length > 0) {
            where = ` WHERE ${this.searchFields.map(field => `${field} LIKE '%${value}%'`).join(" OR ")}`
        }
        const items = this.db.prepare(`SELECT * FROM ${this.tableName} ${where}`).all();
        return items
    }

}

export default AbstractSqliteRepository
