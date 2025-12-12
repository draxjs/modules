
import AuditServiceFactory from "../factory/services/AuditServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import AuditPermissions from "../permissions/AuditPermissions.js";
import type {IAudit, IAuditBase} from "../interfaces/IAudit";

class AuditController extends AbstractFastifyController<IAudit, IAuditBase, IAuditBase>   {

    constructor() {
        super(AuditServiceFactory.instance, AuditPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = true;
        this.userFilter = true;
        this.tenantSetter = true;
        this.userSetter = true;
        this.tenantAssert = true;
        this.userAssert = true;
    }

}

export default AuditController;
export {
    AuditController
}

