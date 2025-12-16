import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";

function generateSearchFields(schema: ISchema) {
    let searchFields = [];
    for(const field in schema){
        if(schema[field].search){
            searchFields.push(`'${field}'`);
        }
    }
    return searchFields.join(', ');
}

function generatePopulateFields(schema: ISchema) {
    let fields = [];
    for(const field in schema){
        if(['ref','array.ref'].includes(schema[field].type)){
            fields.push(`{ field: '${field}', table: '${field}', identifier: '_id' }`);
        }
    }
    return fields.join(',\n');
}

function generateBooleanFields(schema: ISchema) {
    let fields = [];
    for(const field in schema){
        if(['boolean'].includes(schema[field].type)){
            fields.push(`'${field}'`);
        }
    }
    return fields.join(', ');
}

function generateFields(schema: ISchema) {
    let fields = [];
    for(const field in schema){

        switch(schema[field].type){
            case 'number':
                fields.push(`{name: "${field}", type: "FLOAT", unique: ${schema[field].unique}, primary: false}`);
            default:
                fields.push(`{name: "${field}", type: "TEXT", unique: ${schema[field].unique}, primary: false}`);
                break;
        }
    }
    return fields.join(',\n');
}

export const TemplateSqliteRepository = (entity: IEntitySchema) => `
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {I${entity.name}Repository} from '../../interfaces/I${entity.name}Repository'
import type {I${entity.name}, I${entity.name}Base} from "../../interfaces/I${entity.name}";
import {SqliteTableField} from "@drax/common-back";

class ${entity.name}SqliteRepository extends AbstractSqliteRepository<I${entity.name}, I${entity.name}Base, I${entity.name}Base> implements I${entity.name}Repository {

    protected db: any;
    protected tableName: string = '${entity.name}';
    protected dataBaseFile: string;
    protected searchFields: string[] = [${generateSearchFields(entity.schema)}];
    protected booleanFields: string[] = [${generateBooleanFields(entity.schema)}];
    protected identifier: string = '${entity.identifier || '_id'}';
    protected populateFields = [
        ${generatePopulateFields(entity.schema)}
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        ${generateFields(entity.schema)}
    ]
  
}

export default ${entity.name}SqliteRepository
export {${entity.name}SqliteRepository}

`

