
import {IDraxCrud} from "@drax/common-share";
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IPerson, IPersonBase} from '../interfaces/IPerson'

class PersonProvider extends AbstractCrudRestProvider<IPerson, IPersonBase, IPersonBase> implements IDraxCrud<IPerson, IPersonBase, IPersonBase> {
    
  static singleton: PersonProvider
    
  constructor() {
   super('/api/person')
  }
  
  static get instance() {
    if(!PersonProvider.singleton){
      PersonProvider.singleton = new PersonProvider()
    }
    return PersonProvider.singleton
  }

}

export default PersonProvider

