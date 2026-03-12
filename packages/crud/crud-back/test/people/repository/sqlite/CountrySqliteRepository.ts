
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICountryRepository} from '../../interfaces/ICountryRepository'
import type {ICountry, ICountryBase} from "../../interfaces/ICountry";
import {SqliteTableField} from "@drax/common-back";

class CountrySqliteRepository extends AbstractSqliteRepository<ICountry, ICountryBase, ICountryBase> implements ICountryRepository {

    protected db: any;
    protected tableName: string = 'Country';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'tenant', table: 'tenant', identifier: '_id' },
{ field: 'createdBy', table: 'createdBy', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: true, primary: false},
{name: "description", type: "TEXT", unique: false, primary: false},
{name: "flag", type: "TEXT", unique: false, primary: false},
{name: "metadata", type: "TEXT", unique: false, primary: false},
{name: "tenant", type: "TEXT", unique: false, primary: false},
{name: "createdBy", type: "TEXT", unique: false, primary: false}
    ]
  
}

export default CountrySqliteRepository
export {CountrySqliteRepository}

