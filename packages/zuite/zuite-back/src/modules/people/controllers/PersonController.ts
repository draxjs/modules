
import PersonServiceFactory from "../factory/services/PersonServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PersonPermissions from "../permissions/PersonPermissions.js";
import type {IPerson, IPersonBase} from "../interfaces/IPerson";

class PersonController extends AbstractFastifyController<IPerson, IPersonBase, IPersonBase>   {

    constructor() {
        super(PersonServiceFactory.instance, PersonPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = true;
        this.userFilter = false;
        this.tenantSetter = true;
        this.userSetter = false;
        this.tenantAssert = true;
        this.userAssert = false;
    }

}

export default PersonController;
export {
    PersonController
}

