
import type{ILanguageRepository} from "../interfaces/ILanguageRepository";
import type {ILanguageBase, ILanguage} from "../interfaces/ILanguage";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class LanguageService extends AbstractService<ILanguage, ILanguageBase, ILanguageBase> {

    constructor(LanguageRepository: ILanguageRepository, schema?: ZodObject<ZodRawShape>) {
        super(LanguageRepository, schema);
    }

}

export default LanguageService
export {LanguageService}
