import {ITenant, ITenantBase} from '@drax/identity-share'
import {ITenantRepository} from '../../interfaces/ITenantRepository'
import {UUID} from "crypto";
import sqlite from "better-sqlite3";
import {randomUUID} from "node:crypto";
import {IDraxPaginateResult, IDraxPaginateOptions} from "@drax/common-share";
import {SqliteErrorToValidationError} from "@drax/common-back";

const tenantTableSQL: string = `
    CREATE TABLE IF NOT EXISTS tenants
    (
        id TEXT PRIMARY KEY,
        name TEXT
    );
`;

class TenantSqliteRepository implements ITenantRepository{

    private db: any;

    constructor(DATABASE:string, verbose:boolean = false) {
        this.db = new sqlite(DATABASE, {verbose: verbose ? console.log : null});
        this.table()
    }

    table() {
        this.db.exec(tenantTableSQL);
    }



    async create(tenantData: ITenantBase): Promise<ITenant> {
        try{

            if(!tenantData.id){
                tenantData.id = randomUUID()
            }


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
                       orderDesc= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>>{
        const offset = page > 1 ? (page - 1) * limit : 0

        let where=""
        if (search) {
            where = ` WHERE name LIKE '%${search}%'`
        }

        const rCount = this.db.prepare('SELECT COUNT(*) as count FROM tenants'+where).get();
        const tenants = this.db.prepare('SELECT * FROM tenants LIMIT ? OFFSET ?'+where).all([limit, offset]);

        return {
            page: page,
            limit: limit,
            total: rCount.count,
            items: tenants
        }
    }


}

export default TenantSqliteRepository
