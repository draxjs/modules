
import {AbstractMongoRepository} from "@drax/crud-back";
import {AgentSessionModel} from "../../models/AgentSessionModel.js";
import type {IAgentSessionRepository} from '../../interfaces/IAgentSessionRepository'
import type {IAgentSession, IAgentSessionBase} from "../../interfaces/IAgentSession";


class AgentSessionMongoRepository extends AbstractMongoRepository<IAgentSession, IAgentSessionBase, IAgentSessionBase> implements IAgentSessionRepository {

    constructor() {
        super();
        this._model = AgentSessionModel;
        this._searchFields = ['sessionId', 'title'];
        this._populateFields = ['tenant', 'user'];
        this._lean = true
    }

}

export default AgentSessionMongoRepository
export {AgentSessionMongoRepository}

