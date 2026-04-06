
import type{ILanguageRepository} from "../interfaces/ILanguageRepository";
import type {ILanguageBase, ILanguage} from "../interfaces/ILanguage";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class LanguageService extends AbstractService<ILanguage, ILanguageBase, ILanguageBase> {


    constructor(LanguageRepository: ILanguageRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(LanguageRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default LanguageService
export {LanguageService}
