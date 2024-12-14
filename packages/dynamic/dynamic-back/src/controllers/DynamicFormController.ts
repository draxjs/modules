
import DynamicFormServiceFactory from "../factory/services/DynamicFormServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import DynamicFormPermissions from "../permissions/DynamicFormPermissions.js";
import type {IDynamicForm, IDynamicFormBase} from "../interfaces/IDynamicForm";

class DynamicFormController extends AbstractFastifyController<IDynamicForm, IDynamicFormBase, IDynamicFormBase>   {

    constructor() {
        super(DynamicFormServiceFactory.instance, DynamicFormPermissions)
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

export default DynamicFormController;
export {
    DynamicFormController
}

