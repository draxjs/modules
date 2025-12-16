
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IPersonRepository} from '../../interfaces/IPersonRepository'
import type {IPerson, IPersonBase} from "../../interfaces/IPerson";
import {SqliteTableField} from "@drax/common-back";

class PersonSqliteRepository extends AbstractSqliteRepository<IPerson, IPersonBase, IPersonBase> implements IPersonRepository {

    protected db: any;
    protected tableName: string = 'Person';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['fullname', 'hobbies', 'race', 'interests'];
    protected booleanFields: string[] = ['live'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'nationality', table: 'nationality', identifier: '_id' },
{ field: 'languages', table: 'languages', identifier: '_id' },
{ field: 'tenant', table: 'tenant', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "fullname", type: "TEXT", unique: true, primary: false},
{name: "live", type: "TEXT", unique: false, primary: false},
{name: "birthdate", type: "TEXT", unique: false, primary: false},
{name: "secret", type: "TEXT", unique: false, primary: false},
{name: "nationality", type: "TEXT", unique: false, primary: false},
{name: "hobbies", type: "TEXT", unique: false, primary: false},
{name: "race", type: "TEXT", unique: false, primary: false},
{name: "interests", type: "TEXT", unique: false, primary: false},
{name: "languages", type: "TEXT", unique: false, primary: false},
{name: "address", type: "TEXT", unique: undefined, primary: false},
{name: "skills", type: "TEXT", unique: undefined, primary: false},
{name: "tenant", type: "TEXT", unique: false, primary: false},
{name: "user", type: "TEXT", unique: false, primary: false}
    ]
  
}

export default PersonSqliteRepository
export {PersonSqliteRepository}

