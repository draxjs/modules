
import {IDraxCrud} from "@drax/common-share";
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ILanguage, ILanguageBase} from '../interfaces/ILanguage'

class LanguageProvider extends AbstractCrudRestProvider<ILanguage, ILanguageBase, ILanguageBase> implements IDraxCrud<ILanguage, ILanguageBase, ILanguageBase> {
    
  static singleton: LanguageProvider
    
  constructor() {
   super('/api/language')
  }
  
  static get instance() {
    if(!LanguageProvider.singleton){
      LanguageProvider.singleton = new LanguageProvider()
    }
    return LanguageProvider.singleton
  }

}

export default LanguageProvider

