
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IFileRepository} from '../../interfaces/IFileRepository'
import type {IFile, IFileBase} from "../../interfaces/IFile";
import {SqliteTableField} from "@drax/common-back";

class FileSqliteRepository extends AbstractSqliteRepository<IFile, IFileBase, IFileBase> implements IFileRepository {

    protected db: any;
    protected tableName: string = 'File';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['filename', 'relativePath', 'absolutePath', 'url', 'description', 'tags', 'mimetype', 'extension', 'type'];
    protected booleanFields: string[] = ['isPublic'];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "filename", type: "TEXT", unique: undefined, primary: false},
        {name: "relativePath", type: "TEXT", unique: undefined, primary: false},
        {name: "absolutePath", type: "TEXT", unique: undefined, primary: false},
        {name: "url", type: "TEXT", unique: undefined, primary: false},
        {name: "description", type: "TEXT", unique: undefined, primary: false},
        {name: "tags", type: "TEXT", unique: undefined, primary: false},
        {name: "mimetype", type: "TEXT", unique: undefined, primary: false},
        {name: "encoding", type: "TEXT", unique: undefined, primary: false},
        {name: "extension", type: "TEXT", unique: undefined, primary: false},
        {name: "size", type: "REAL", unique: undefined, primary: false},
        {name: "type", type: "TEXT", unique: undefined, primary: false},
        {name: "lastAccess", type: "TEXT", unique: undefined, primary: false},
        {name: "createdAt", type: "TEXT", unique: undefined, primary: false},
        {name: "updatedAt", type: "TEXT", unique: undefined, primary: false},
        {name: "createdBy", type: "TEXT", unique: undefined, primary: false},
        {name: "updatedBy", type: "TEXT", unique: undefined, primary: false},
        {name: "createdFor", type: "TEXT", unique: undefined, primary: false},
        {name: "ttlSeconds", type: "REAL", unique: undefined, primary: false},
        {name: "expiresAt", type: "TEXT", unique: undefined, primary: false},
        {name: "isPublic", type: "TEXT", unique: undefined, primary: false},
        {name: "hits", type: "REAL", unique: undefined, primary: false}
    ]
  
}

export default FileSqliteRepository
export {FileSqliteRepository}
