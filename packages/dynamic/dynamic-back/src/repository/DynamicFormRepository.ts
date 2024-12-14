
import {AbstractMongoRepository} from "@drax/crud-back";
import {DynamicFormModel} from "../models/DynamicFormModel.js";
import type {IDynamicFormRepository} from '../interfaces/IDynamicFormRepository'
import type {IDynamicForm, IDynamicFormBase} from "../interfaces/IDynamicForm";


class DynamicFormMongoRepository extends AbstractMongoRepository<IDynamicForm, IDynamicFormBase, IDynamicFormBase> implements IDynamicFormRepository {

    constructor() {
        super();
        this._model = DynamicFormModel;
        this._searchFields = ['identifier'];
         this._populateFields = [];
    }

}

export default DynamicFormMongoRepository
export {DynamicFormMongoRepository}

