
import type {ILanguage, ILanguageBase} from './ILanguage'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ILanguageRepository extends IDraxCrudRepository<ILanguage, ILanguageBase, ILanguageBase>{

}

export {ILanguageRepository}


