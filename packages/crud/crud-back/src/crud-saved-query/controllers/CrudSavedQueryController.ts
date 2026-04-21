import AbstractFastifyController from "../../controllers/AbstractFastifyController.js";
import CrudSavedQueryServiceFactory from "../factory/services/CrudSavedQueryServiceFactory.js";
import CrudSavedQueryPermissions from "../permissions/CrudSavedQueryPermissions.js";
import type {IDraxFieldFilter} from "@drax/crud-share";
import type {ICrudSavedQuery, ICrudSavedQueryBase} from "../interfaces/ICrudSavedQuery";
import type {CustomRequest} from "../../controllers/AbstractFastifyController";

class CrudSavedQueryController extends AbstractFastifyController<ICrudSavedQuery, ICrudSavedQueryBase, ICrudSavedQueryBase> {
    constructor() {
        super(CrudSavedQueryServiceFactory.instance, CrudSavedQueryPermissions);
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;
        this.userSetter = true;
        this.userAssert = true;
        this.userFilter = false
    }

    async preRead(request: CustomRequest, filters: IDraxFieldFilter[]): Promise<IDraxFieldFilter[]> {
        filters.push(
            {field: "shared", operator: "eq", value: true, orGroup: "crudSavedQueryVisibility"},
            {field: this.userField, operator: "eq", value: request.rbac.userId, orGroup: "crudSavedQueryVisibility"}
        );

        return filters;
    }
}

export default CrudSavedQueryController;
export {CrudSavedQueryController};
