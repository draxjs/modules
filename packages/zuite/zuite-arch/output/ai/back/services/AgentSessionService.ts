
import type{IAgentSessionRepository} from "../interfaces/IAgentSessionRepository";
import type {IAgentSessionBase, IAgentSession} from "../interfaces/IAgentSession";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class AgentSessionService extends AbstractService<IAgentSession, IAgentSessionBase, IAgentSessionBase> {


    constructor(AgentSessionRepository: IAgentSessionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(AgentSessionRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default AgentSessionService
export {AgentSessionService}
