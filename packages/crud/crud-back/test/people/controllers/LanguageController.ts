
import LanguageServiceFactory from "../factory/services/LanguageServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import LanguagePermissions from "../permissions/LanguagePermissions.js";
import type {ILanguage, ILanguageBase} from "../interfaces/ILanguage";

class LanguageController extends AbstractFastifyController<ILanguage, ILanguageBase, ILanguageBase>   {

    constructor() {
        super(LanguageServiceFactory.instance, LanguagePermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default LanguageController;
export {
    LanguageController
}

