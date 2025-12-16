import type {IAuditRepository} from '../../interfaces/IAuditRepository'
import {IAudit, IAuditBase} from "@drax/audit-share";
import {
    SqliteTableField,
} from "@drax/common-back";
import {AbstractSqliteRepository} from "@drax/crud-back";


class AuditSqliteRepository extends AbstractSqliteRepository<IAudit, IAuditBase, IAuditBase> implements IAuditRepository {

    protected db: any;
    protected tableName: string = 'audits';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = []
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "entity", type: "TEXT", unique: false, primary: false},
        {name: "resourceId", type: "TEXT", unique: false, primary: false},
        {name: "user", type: "TEXT", unique: false, primary: false},
        {name: "action", type: "TEXT", unique: false, primary: false},
        {name: "ip", type: "TEXT", unique: false, primary: false},
        {name: "userAgent", type: "TEXT", unique: false, primary: false},
        {name: "changes", type: "TEXT", unique: false, primary: false},
        {name: "sessionId", type: "TEXT", unique: false, primary: false},
        {name: "requestId", type: "TEXT", unique: false, primary: false},
        {name: "detail", type: "TEXT", unique: false, primary: false},
        {name: "tenant", type: "TEXT", unique: false, primary: false},
        {name: "apiKey", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false},
    ]



    async prepareData(data: any) {
        if (!data) {
            return
        }

        if (data && data.changes) {
            data.changes = JSON.stringify(data.changes)
        }

        if (data && data.user) {
            data.user = JSON.stringify(data.user)
        }

        if (data && data.tenant) {
            data.tenant = JSON.stringify(data.tenant)
        }


        if (data && data.apiKey) {
            data.apiKey = JSON.stringify(data.apiKey)
        }



    }

    async prepareItem(item: any) {

        if (!item) {
            return
        }

        if (item && item.changes) {
            item.changes = JSON.parse(item.changes)
        }


        if (item && item.user) {
            item.user = JSON.parse(item.user)
        }

        if (item && item.tenant) {
            item.tenant = JSON.parse(item.tenant)
        }

        if (item && item.apiKey) {
            item.apiKey = JSON.parse(item.apiKey)
        }


        return item;
    }

}

export default AuditSqliteRepository
export {AuditSqliteRepository}
