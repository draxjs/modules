import {ITenant, ITenantBase} from '@drax/identity-share'
import {ITenantRepository} from '../../interfaces/ITenantRepository'
import type {SqliteTableField} from "@drax/common-back";
import {AbstractSqliteRepository} from "@drax/crud-back";

class TenantSqliteRepository extends AbstractSqliteRepository<ITenant,ITenantBase,ITenantBase> implements ITenantRepository{

    protected db: any;
    protected tableName: string = 'tenants';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = []
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false},
    ]
    protected verbose: boolean;


    override build(): void {
        super.build()

        try {
            // A separate index also upgrades existing tables; BINARY matches Mongo's exact names.
            this.db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS tenants_name_unique ON ${this.tableName} (name COLLATE BINARY)`)
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw Object.assign(new Error(
                    'Cannot create unique index tenants_name_unique: tenants contains duplicate names. ' +
                    'Find duplicates with SELECT name COLLATE BINARY AS name, COUNT(*) AS count FROM tenants ' +
                    'GROUP BY name COLLATE BINARY HAVING COUNT(*) > 1; ' +
                    'Resolve these duplicates manually and retry initialization. No tenants were deleted or renamed.'
                ), {cause: error})
            }
            throw error
        }
    }

    async findByName(name: string): Promise<ITenant | null>{
        const tenant = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE name = ?`).get(name);
        return tenant
    }


}

export default TenantSqliteRepository
