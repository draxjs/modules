
import type {ILanguage, ILanguageBase} from './ILanguage'
import {ICrudRepository} from "@drax/crud-back";

interface ILanguageRepository extends ICrudRepository<ILanguage, ILanguageBase, ILanguageBase>{

}

export {ILanguageRepository}


