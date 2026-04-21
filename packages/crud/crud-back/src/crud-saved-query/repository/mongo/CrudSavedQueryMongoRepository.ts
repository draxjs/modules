import AbstractMongoRepository from "../../../repository/AbstractMongoRepository.js";
import {CrudSavedQueryModel} from "../../models/CrudSavedQueryModel.js";
import type {ICrudSavedQueryRepository} from "../../interfaces/ICrudSavedQueryRepository";
import type {ICrudSavedQuery, ICrudSavedQueryBase} from "../../interfaces/ICrudSavedQuery";

class CrudSavedQueryMongoRepository
    extends AbstractMongoRepository<ICrudSavedQuery, ICrudSavedQueryBase, ICrudSavedQueryBase>
    implements ICrudSavedQueryRepository {

    constructor() {
        super();
        this._model = CrudSavedQueryModel;
        this._searchFields = ["name", "entity"];
        this._populateFields = ["tenant", "user"];
    }
}

export default CrudSavedQueryMongoRepository;
export {CrudSavedQueryMongoRepository};
