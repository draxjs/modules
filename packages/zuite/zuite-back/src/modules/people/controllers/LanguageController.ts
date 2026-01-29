
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
        this.userFilter = false;
        this.tenantSetter = false;
        this.userSetter = false;
        this.tenantAssert = false;
        this.userAssert = false;
    }

    async postCreate(req, item: ILanguage) {
        console.log('Create new language:', item)
        return item
    }

    async postUpdate(req, item: ILanguage) {
        console.log('Update language:', item)
        return item
    }

    async postUpdatePartial(req, item: ILanguage) {
        console.log('UpdatePartial language:', item)
        return item
    }

    async postDelete(req, item: ILanguage) {
        console.log('Delete language:', item)
        return item
    }

}

export default LanguageController;
export {
    LanguageController
}

