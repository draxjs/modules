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
    let searchFields = [];
    for(const field in schema){
        if(['ref','array.ref'].includes(schema[field].type)){
            searchFields.push(`'${field}'`);
        }
    }
    return searchFields.join(', ');
}

export const TemplateMongoRepository = (entity: IEntitySchema) => `
import {AbstractMongoRepository} from "@drax/crud-back";
import {${entity.name}Model} from "../../models/${entity.name}Model.js";
import type {I${entity.name}Repository} from '../../interfaces/I${entity.name}Repository'
import type {I${entity.name}, I${entity.name}Base} from "../../interfaces/I${entity.name}";


class ${entity.name}MongoRepository extends AbstractMongoRepository<I${entity.name}, I${entity.name}Base, I${entity.name}Base> implements I${entity.name}Repository {

    constructor() {
        super();
        this._model = ${entity.name}Model;
        this._searchFields = [${generateSearchFields(entity.schema)}];
        this._populateFields = [${generatePopulateFields(entity.schema)}];
        this._lean = true
    }

}

export default ${entity.name}MongoRepository
export {${entity.name}MongoRepository}

`

