
import {AbstractMongoRepository} from "@drax/crud-back";
import {PersonModel} from "../../models/PersonModel.js";
import type {IPersonRepository} from '../../interfaces/IPersonRepository'
import type {IPerson, IPersonBase} from "../../interfaces/IPerson";


class PersonMongoRepository extends AbstractMongoRepository<IPerson, IPersonBase, IPersonBase> implements IPersonRepository {

    constructor() {
        super();
        this._model = PersonModel;
        this._searchFields = ['fullname', 'hobbies', 'race', 'interests'];
         this._populateFields = ['nationality', 'languages', 'tenant', 'user'];
    }

}

export default PersonMongoRepository
export {PersonMongoRepository}

