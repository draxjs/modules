
import GroupZoneServiceFactory from "../factory/services/GroupZoneServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import GroupZonePermissions from "../permissions/GroupZonePermissions.js";
import type {IGroupZone, IGroupZoneBase} from "../interfaces/IGroupZone";
import {IDraxFieldFilter} from "@drax/crud-share";

class GroupZoneController extends AbstractFastifyController<IGroupZone, IGroupZoneBase, IGroupZoneBase>   {

    constructor() {
        super(GroupZoneServiceFactory.instance, GroupZonePermissions)
        this.tenantField = "tenant";
        this.userField = "users";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

    async preRead(request:any, filters: IDraxFieldFilter[]) {
        const userId = request.rbac.userId
        filters.push({field: this.userField, operator: "in", value: [userId]})
        return filters
    }

}

export default GroupZoneController;
export {
    GroupZoneController
}

