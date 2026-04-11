
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IAILogRepository} from '../../interfaces/IAILogRepository'
import type {IAILog, IAILogBase} from "@drax/ai-share";
import {SqliteTableField} from "@drax/common-back";

class AILogSqliteRepository extends AbstractSqliteRepository<IAILog, IAILogBase, IAILogBase> implements IAILogRepository {

    protected db: any;
    protected tableName: string = 'AILog';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['provider', 'model', 'operationTitle', 'operationGroup', 'ip', 'userAgent', 'input', 'output', 'errorMessage'];
    protected booleanFields: string[] = ['success'];
    protected jsonFields: string[] = ['inputImages', 'inputFiles'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'tenant', table: 'tenant', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "provider", type: "TEXT", unique: false, primary: false},
{name: "model", type: "TEXT", unique: false, primary: false},
{name: "operationTitle", type: "TEXT", unique: false, primary: false},
{name: "operationGroup", type: "TEXT", unique: false, primary: false},
{name: "ip", type: "TEXT", unique: false, primary: false},
{name: "userAgent", type: "TEXT", unique: false, primary: false},
{name: "input", type: "TEXT", unique: false, primary: false},
{name: "inputImages", type: "TEXT", unique: false, primary: false},
{name: "inputFiles", type: "TEXT", unique: false, primary: false},
{name: "inputTokens", type: "INTEGER", unique: false, primary: false},
{name: "inputTokens", type: "TEXT", unique: false, primary: false},
{name: "outputTokens", type: "INTEGER", unique: false, primary: false},
{name: "outputTokens", type: "TEXT", unique: false, primary: false},
{name: "tokens", type: "INTEGER", unique: false, primary: false},
{name: "tokens", type: "TEXT", unique: false, primary: false},
{name: "startedAt", type: "TEXT", unique: false, primary: false},
{name: "endedAt", type: "TEXT", unique: false, primary: false},
{name: "responseTime", type: "TEXT", unique: false, primary: false},
{name: "output", type: "TEXT", unique: false, primary: false},
{name: "success", type: "TEXT", unique: false, primary: false},
{name: "statusCode", type: "INTEGER", unique: false, primary: false},
{name: "statusCode", type: "TEXT", unique: false, primary: false},
{name: "errorMessage", type: "TEXT", unique: false, primary: false},
{name: "tenant", type: "TEXT", unique: false, primary: false},
{name: "user", type: "TEXT", unique: false, primary: false}
    ]

}

export default AILogSqliteRepository
export {AILogSqliteRepository}

