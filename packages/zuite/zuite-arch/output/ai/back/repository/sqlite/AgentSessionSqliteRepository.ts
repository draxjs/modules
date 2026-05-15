
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IAgentSessionRepository} from '../../interfaces/IAgentSessionRepository'
import type {IAgentSession, IAgentSessionBase} from "../../interfaces/IAgentSession";
import {SqliteTableField} from "@drax/common-back";

class AgentSessionSqliteRepository extends AbstractSqliteRepository<IAgentSession, IAgentSessionBase, IAgentSessionBase> implements IAgentSessionRepository {

    protected db: any;
    protected tableName: string = 'AgentSession';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['sessionId', 'title'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['messages'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'tenant', table: 'tenant', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "sessionId", type: "TEXT", unique: false, primary: false},
{name: "title", type: "TEXT", unique: false, primary: false},
{name: "lastMessageAt", type: "TEXT", unique: false, primary: false},
{name: "messages", type: "TEXT", unique: false, primary: false},
{name: "messageCount", type: "NUMERIC", unique: false, primary: false},
{name: "messageCount", type: "TEXT", unique: false, primary: false},
{name: "inputTokens", type: "NUMERIC", unique: false, primary: false},
{name: "inputTokens", type: "TEXT", unique: false, primary: false},
{name: "outputTokens", type: "NUMERIC", unique: false, primary: false},
{name: "outputTokens", type: "TEXT", unique: false, primary: false},
{name: "tokens", type: "NUMERIC", unique: false, primary: false},
{name: "tokens", type: "TEXT", unique: false, primary: false},
{name: "tenant", type: "TEXT", unique: false, primary: false},
{name: "user", type: "TEXT", unique: false, primary: false}
    ]
  
}

export default AgentSessionSqliteRepository
export {AgentSessionSqliteRepository}

