
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IGroupZoneRepository} from '../../interfaces/IGroupZoneRepository'
import type {IGroupZone, IGroupZoneBase} from "../../interfaces/IGroupZone";
import {SqliteTableField} from "@drax/common-back";

class GroupZoneSqliteRepository extends AbstractSqliteRepository<IGroupZone, IGroupZoneBase, IGroupZoneBase> implements IGroupZoneRepository {

    protected db: any;
    protected tableName: string = 'GroupZone';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'users', table: 'users', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: true, primary: false},
{name: "users", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default GroupZoneSqliteRepository
export {GroupZoneSqliteRepository}

