
import {AbstractMongoRepository} from "@drax/crud-back";
import {PersonModel} from "../models/PersonModel.js";
import type {IPersonRepository} from '../interfaces/IPersonRepository'
import type {IPerson, IPersonBase} from "../interfaces/IPerson";


class PersonMongoRepository extends AbstractMongoRepository<IPerson, IPersonBase, IPersonBase> implements IPersonRepository {

    constructor() {
        super();
        this._model = PersonModel;
        this._searchFields = ['fullname', 'hobbies'];
         this._populateFields = ['nationality', 'languages'];
    }

}

export default PersonMongoRepository
export {PersonMongoRepository}
