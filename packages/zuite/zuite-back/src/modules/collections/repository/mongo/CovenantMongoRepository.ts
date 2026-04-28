
import {AbstractMongoRepository} from "@drax/crud-back";
import {CovenantModel} from "../../models/CovenantModel.js";
import type {ICovenantRepository} from '../../interfaces/ICovenantRepository'
import type {ICovenant, ICovenantBase} from "../../interfaces/ICovenant";


class CovenantMongoRepository extends AbstractMongoRepository<ICovenant, ICovenantBase, ICovenantBase> implements ICovenantRepository {

    constructor() {
        super();
        this._model = CovenantModel;
        this._searchFields = ['fullname', 'dni'];
        this._populateFields = ['group', 'createdBy', 'updatedBy', 'refuseBy'];
        this._lean = true
    }

}

export default CovenantMongoRepository
export {CovenantMongoRepository}

