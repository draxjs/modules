
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IAgentSession, IAgentSessionBase} from '../interfaces/IAgentSession'

class AgentSessionProvider extends AbstractCrudRestProvider<IAgentSession, IAgentSessionBase, IAgentSessionBase> {
    
  static singleton: AgentSessionProvider
    
  constructor() {
   super('/api/agentsession')
  }
  
  static get instance() {
    if(!AgentSessionProvider.singleton){
      AgentSessionProvider.singleton = new AgentSessionProvider()
    }
    return AgentSessionProvider.singleton
  }

}

export default AgentSessionProvider

