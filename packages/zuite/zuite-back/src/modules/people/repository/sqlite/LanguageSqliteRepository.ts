
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ILanguageRepository} from '../../interfaces/ILanguageRepository'
import type {ILanguage, ILanguageBase} from "../../interfaces/ILanguage";
import {SqliteTableField} from "@drax/common-back";

class LanguageSqliteRepository extends AbstractSqliteRepository<ILanguage, ILanguageBase, ILanguageBase> implements ILanguageRepository {

    protected db: any;
    protected tableName: string = 'Language';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: true, primary: false},
{name: "icon", type: "TEXT", unique: false, primary: false}
    ]
  
}

export default LanguageSqliteRepository
export {LanguageSqliteRepository}

