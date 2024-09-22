
import PersonServiceFactory from "../factory/PersonServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PersonPermissions from "../permissions/PersonPermissions.js";
import type {IPerson, IPersonBase} from "../interfaces/IPerson";

class PersonController extends AbstractFastifyController<IPerson, IPersonBase, IPersonBase>   {

    constructor() {
        super(PersonServiceFactory.instance, PersonPermissions)
    }

}

export default PersonController;
export {
    PersonController
}

