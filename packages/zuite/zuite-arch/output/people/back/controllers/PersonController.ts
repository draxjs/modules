
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
        this.tenantSetter = true;
        this.tenantAssert = true;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default PersonController;
export {
    PersonController
}

