
import type{ILanguageRepository} from "../interfaces/ILanguageRepository";
import type {ILanguageBase, ILanguage} from "../interfaces/ILanguage";
import {AbstractService} from "@drax/crud-back";
import {ZodSchema} from "zod";

class LanguageService extends AbstractService<ILanguage, ILanguageBase, ILanguage> {

    _repository: ILanguageRepository

    constructor(LanguageRepository: ILanguageRepository, schema?: ZodSchema) {
        super(LanguageRepository, schema);
    }

}

export default LanguageService
export {LanguageService}
