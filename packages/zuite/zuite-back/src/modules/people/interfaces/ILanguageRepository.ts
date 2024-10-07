
import type {ILanguage, ILanguageBase} from './ILanguage'
import {IDraxCrud} from "@drax/crud-share";

interface ILanguageRepository extends IDraxCrud<ILanguage, ILanguageBase, ILanguageBase>{

}

export {ILanguageRepository}


