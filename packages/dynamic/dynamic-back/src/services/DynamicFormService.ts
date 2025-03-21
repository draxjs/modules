
import type{IDynamicFormRepository} from "../interfaces/IDynamicFormRepository";
import type {IDynamicFormBase, IDynamicForm} from "../interfaces/IDynamicForm";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class DynamicFormService extends AbstractService<IDynamicForm, IDynamicFormBase, IDynamicFormBase> {

    constructor(DynamicFormRepository: IDynamicFormRepository, schema?: ZodObject<ZodRawShape>) {
        super(DynamicFormRepository, schema);
    }

}

export default DynamicFormService
export {DynamicFormService}
