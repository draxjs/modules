
import {AbstractMongoRepository} from "@drax/crud-back";
import {AuditModel} from "../../models/AuditModel.js";
import type {IAuditRepository} from '../../interfaces/IAuditRepository'
import type {IAudit, IAuditBase} from "@drax/audit-share";


class AuditMongoRepository extends AbstractMongoRepository<IAudit, IAuditBase, IAuditBase> implements IAuditRepository {

    constructor() {
        super();
        this._model = AuditModel;
        this._searchFields = ['entity', 'action', 'sessionId', 'requestId'];
         this._populateFields = [];
    }

}

export default AuditMongoRepository
export {AuditMongoRepository}

