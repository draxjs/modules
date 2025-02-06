import {ISettingRepository} from '../../interfaces/ISettingRepository'
import {UUID} from "crypto";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IDraxPaginateResult, IDraxPaginateOptions} from "@drax/crud-share";
import {ISetting, ISettingBase} from "@drax/settings-share";
import {
    SqliteErrorToValidationError,
    SqliteTableBuilder,
    SqliteTableField,
    SqlQueryFilter,
    SqlSort
} from "@drax/common-back";

const tableFields: SqliteTableField[] = [
    {name: "key", type: "TEXT", unique: true, primary: false},
    {name: "value", type: "TEXT", unique: false, primary: false},
]


class SettingSqliteRepository implements ISettingRepository{

    protected db: any;
    protected dataBaseFile: string;
    protected _searchFields: string[] = []

    constructor(dataBaseFile:string, verbose:boolean = false) {
        this.dataBaseFile = dataBaseFile;
        this._searchFields = ['_id', 'key'];
        this.db = new sqlite(dataBaseFile, {verbose: verbose ? console.log : null});
        this.table()
    }

    table() {
        const builder = new SqliteTableBuilder(
            this.dataBaseFile,
            'settings',
            tableFields,
            false);
        builder.build('id')
    }



    async create(data: ISettingBase): Promise<ISetting> {
        try{

            if(!data.id){
                data.id = randomUUID()
            }

            // data.createdAt = (new Date().toISOString())

            const fields = Object.keys(data)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(data)
                .map(field => `@${field}`)
                .join(', ');


        const stmt = this.db.prepare(`INSERT INTO settings (${fields}) VALUES (${values})`);
        stmt.run(data)
        return this.findById(data.id as UUID)
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, data)
        }
    }



    async update(id: string, data: ISettingBase): Promise<ISetting> {
        try{
            // data.updatedAt = (new Date().toISOString())

            const setClauses = Object.keys(data)
                .map(field => `${field} = @${field}`)
                .join(', ');

            data.id = id

            const stmt = this.db.prepare( `UPDATE settings SET ${setClauses} WHERE id = @id `);

            stmt.run(data);

            return this.findById(id)
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, data)
        }

    }

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       order= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<ISetting>>{
        const offset = page > 1 ? (page - 1) * limit : 0

        let where=""
        if (search) {
            where = ` WHERE name LIKE '%${search}%'`
        }

        where = SqlQueryFilter.applyFilters(where, filters)
        const sort = SqlSort.applySort(orderBy, order)

        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM settings'+where).get();
        where += sort
        const settings = this.db.prepare('SELECT * FROM settings '  + where + ' LIMIT ? OFFSET ?').all([limit, offset]);


        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: settings
        }
    }

    async delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM settings WHERE id = ?');
        stmt.run(id);
        return true
    }

    async deleteAll(): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM settings');
        stmt.run();
        return true
    }

    async findById(id: string): Promise<ISetting | null>{
        const setting = this.db.prepare('SELECT * FROM settings WHERE id = ?').get(id);
        if(setting){
            return setting
        }
        return undefined
    }

    async findByKey(key: string): Promise<ISetting | null>{
        const setting = this.db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
        if(setting){
            return setting
        }
        return undefined
    }

    async fetchAll(): Promise<ISetting[]>{
        const settings = this.db.prepare('SELECT * FROM settings').all();
        return settings
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

export default SettingSqliteRepository
export {SettingSqliteRepository}
