import {ITenant, ITenantBase} from '@drax/identity-share'
import {ITenantRepository} from '../../interfaces/ITenantRepository'
import {UUID} from "crypto";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IDraxPaginateResult, IDraxPaginateOptions} from "@drax/common-share";
import {SqliteErrorToValidationError, SqliteTableBuilder, SqlQueryFilter, SqlSort} from "@drax/common-back";
import type {SqliteTableField} from "@drax/common-back";


const tableFields: SqliteTableField[] = [
    {name: "name", type: "TEXT", unique: false, primary: false},
    {name: "createdAt", type: "TEXT", unique: false, primary: false},
    {name: "updatedAt", type: "TEXT", unique: false, primary: false},
]


class TenantSqliteRepository implements ITenantRepository{

    private db: any;
    private dataBaseFile: string;

    constructor(dataBaseFile:string, verbose:boolean = false) {
        this.dataBaseFile = dataBaseFile;
        this.db = new sqlite(this.dataBaseFile, {verbose: verbose ? console.log : null});
        this.table()
    }

    table() {
        const builder = new SqliteTableBuilder(
            this.dataBaseFile,
            'tenants',
            tableFields,
            false);
        builder.build('id')
    }



    async create(tenantData: ITenantBase): Promise<ITenant> {
        try{

            if(!tenantData.id){
                tenantData.id = randomUUID()
            }

            tenantData.createdAt = (new Date().toISOString())

            const fields = Object.keys(tenantData)
                .map(field => `${field}`)
                .join(', ');

            const values = Object.keys(tenantData)
                .map(field => `@${field}`)
                .join(', ');

        const stmt = this.db.prepare(`INSERT INTO tenants (${fields}) VALUES (${values})`);
        stmt.run(tenantData)
        return this.findById(tenantData.id as UUID)
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, tenantData)
        }
    }

    async findById(id: string): Promise<ITenant | null>{
        const tenant = this.db.prepare('SELECT * FROM tenants WHERE id = ?').get(id);
        return tenant
    }

    async findByName(name: string): Promise<ITenant | null>{
        const tenant = this.db.prepare('SELECT * FROM tenants WHERE name = ?').get(name);
        return tenant
    }

    async update(id: string, tenantData: ITenantBase): Promise<ITenant> {
        try{

            tenantData.updatedAt = (new Date().toISOString())

            const setClauses = Object.keys(tenantData)
                .map(field => `${field} = @${field}`)
                .join(', ');

            tenantData.id = id

            const stmt = this.db.prepare( `UPDATE tenants SET ${setClauses} WHERE id = @id `);
            stmt.run(tenantData);
            return this.findById(id)
        }catch (e){
            console.log(e)
            throw SqliteErrorToValidationError(e, tenantData)
        }

    }

    async delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM tenants WHERE id = ?');
        stmt.run(id);
        return true
    }

    async deleteAll(): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM tenants');
        stmt.run();
        return true
    }

    async fetchAll(): Promise<ITenant[]>{
        const tenants = this.db.prepare('SELECT * FROM tenants').all();
        for (const tenant of tenants) {
            tenant.permissions = tenant.permissions? tenant.permissions.split(",") : []
        }
        return tenants
    }

    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       order= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>>{
        const offset = page > 1 ? (page - 1) * limit : 0

        let where=""
        if (search) {
            where = ` WHERE name LIKE '%${search}%'`
        }

        where = SqlQueryFilter.applyFilters(where, filters)
        const sort = SqlSort.applySort(orderBy, order)

        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM tenants'+where).get();
        where += sort
        const tenants = this.db.prepare('SELECT * FROM tenants '  + where + ' LIMIT ? OFFSET ?').all([limit, offset]);

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: tenants
        }
    }


}

export default TenantSqliteRepository
