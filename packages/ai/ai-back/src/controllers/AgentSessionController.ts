
import AgentSessionServiceFactory from "../factory/services/AgentSessionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import AgentSessionPermissions from "../permissions/AgentSessionPermissions.js";
import type {IAgentSession, IAgentSessionBase} from "../interfaces/IAgentSession";

class AgentSessionController extends AbstractFastifyController<IAgentSession, IAgentSessionBase, IAgentSessionBase>   {

    constructor() {
        super(AgentSessionServiceFactory.instance, AgentSessionPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default AgentSessionController;
export {
    AgentSessionController
}

