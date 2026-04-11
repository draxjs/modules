
import {AbstractMongoRepository} from "@drax/crud-back";
import {AILogModel} from "../../models/AILogModel.js";
import type {IAILogRepository} from '../../interfaces/IAILogRepository'
import type {IAILog, IAILogBase} from "@drax/ai-share";


class AILogMongoRepository extends AbstractMongoRepository<IAILog, IAILogBase, IAILogBase> implements IAILogRepository {

    constructor() {
        super();
        this._model = AILogModel;
        this._searchFields = ['provider', 'model', 'operationTitle', 'operationGroup', 'ip', 'userAgent', 'input', 'output', 'errorMessage'];
        this._populateFields = ['tenant', 'user'];
        this._lean = true
    }

}

export default AILogMongoRepository
export {AILogMongoRepository}

