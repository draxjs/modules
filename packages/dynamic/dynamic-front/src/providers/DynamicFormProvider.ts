
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IDynamicForm, IDynamicFormBase} from '@drax/crud-share'

class DynamicFormProvider extends AbstractCrudRestProvider<IDynamicForm, IDynamicFormBase, IDynamicFormBase> {

  static singleton: DynamicFormProvider

  constructor() {
   super('/api/dynamicform')
  }

  static get instance() {
    if(!DynamicFormProvider.singleton){
      DynamicFormProvider.singleton = new DynamicFormProvider()
    }
    return DynamicFormProvider.singleton
  }

}

export default DynamicFormProvider
export {DynamicFormProvider}
