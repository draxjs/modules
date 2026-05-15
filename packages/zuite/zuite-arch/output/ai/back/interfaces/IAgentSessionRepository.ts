
import type {IAgentSession, IAgentSessionBase} from './IAgentSession'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IAgentSessionRepository extends IDraxCrudRepository<IAgentSession, IAgentSessionBase, IAgentSessionBase>{

}

export {IAgentSessionRepository}


