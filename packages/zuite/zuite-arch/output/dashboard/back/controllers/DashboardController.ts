
import DashboardServiceFactory from "../factory/services/DashboardServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import DashboardPermissions from "../permissions/DashboardPermissions.js";
import type {IDashboard, IDashboardBase} from "../interfaces/IDashboard";

class DashboardController extends AbstractFastifyController<IDashboard, IDashboardBase, IDashboardBase>   {

    constructor() {
        super(DashboardServiceFactory.instance, DashboardPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = false;
        this.userFilter = false;
        this.tenantSetter = false;
        this.userSetter = false;
        this.tenantAssert = false;
        this.userAssert = false;
    }

}

export default DashboardController;
export {
    DashboardController
}

