
import LanguageServiceFactory from "../factory/LanguageServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import LanguagePermissions from "../permissions/LanguagePermissions.js";
import type {ILanguage, ILanguageBase} from "../interfaces/ILanguage";

class LanguageController extends AbstractFastifyController<ILanguage, ILanguageBase, ILanguageBase>   {

    constructor() {
        super(LanguageServiceFactory.instance, LanguagePermissions)
    }

}

export default LanguageController;
export {
    LanguageController
}

