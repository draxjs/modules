
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICovenantRepository} from '../../interfaces/ICovenantRepository'
import type {ICovenant, ICovenantBase} from "../../interfaces/ICovenant";
import {SqliteTableField} from "@drax/common-back";

class CovenantSqliteRepository extends AbstractSqliteRepository<ICovenant, ICovenantBase, ICovenantBase> implements ICovenantRepository {

    protected db: any;
    protected tableName: string = 'Covenant';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['fullname', 'dni'];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'group', table: 'group', identifier: '_id' },
{ field: 'createdBy', table: 'createdBy', identifier: '_id' },
{ field: 'updatedBy', table: 'updatedBy', identifier: '_id' },
{ field: 'refuseBy', table: 'refuseBy', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "date", type: "TEXT", unique: undefined, primary: false},
{name: "link", type: "TEXT", unique: undefined, primary: false},
{name: "since", type: "TEXT", unique: undefined, primary: false},
{name: "until", type: "TEXT", unique: undefined, primary: false},
{name: "month", type: "TEXT", unique: undefined, primary: false},
{name: "fullname", type: "TEXT", unique: undefined, primary: false},
{name: "dni", type: "TEXT", unique: undefined, primary: false},
{name: "locality", type: "TEXT", unique: undefined, primary: false},
{name: "address", type: "TEXT", unique: undefined, primary: false},
{name: "amount", type: "NUMERIC", unique: undefined, primary: false},
{name: "amount", type: "TEXT", unique: undefined, primary: false},
{name: "comment", type: "TEXT", unique: undefined, primary: false},
{name: "group", type: "TEXT", unique: undefined, primary: false},
{name: "createdBy", type: "TEXT", unique: undefined, primary: false},
{name: "updatedBy", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "refuseComment", type: "TEXT", unique: undefined, primary: false},
{name: "refuseBy", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default CovenantSqliteRepository
export {CovenantSqliteRepository}

