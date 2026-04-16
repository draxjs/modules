
import AILogServiceFactory from "../factory/services/AILogServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import AILogPermissions from "../permissions/AILogPermissions.js";
import type {IAILog, IAILogBase} from "../interfaces/IAILog";

class AILogController extends AbstractFastifyController<IAILog, IAILogBase, IAILogBase>   {

    constructor() {
        super(AILogServiceFactory.instance, AILogPermissions)
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

export default AILogController;
export {
    AILogController
}

