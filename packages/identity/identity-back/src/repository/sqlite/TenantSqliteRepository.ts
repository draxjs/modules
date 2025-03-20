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


    async findByName(name: string): Promise<ITenant | null>{
        const tenant = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE name = ?`).get(name);
        return tenant
    }


}

export default TenantSqliteRepository
