
import type {IDynamicForm, IDynamicFormBase} from './IDynamicForm'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IDynamicFormRepository extends IDraxCrudRepository<IDynamicForm, IDynamicFormBase, IDynamicFormBase>{

}

export {IDynamicFormRepository}


