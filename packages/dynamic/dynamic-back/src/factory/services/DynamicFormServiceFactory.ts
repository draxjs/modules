
import DynamicFormRepository from '../../repository/DynamicFormRepository.js'
import {DynamicFormService} from '../../services/DynamicFormService.js'
import {DynamicFormSchema} from "../../schemas/DynamicFormSchema.js";

class DynamicFormServiceFactory {
    private static service: DynamicFormService;

    public static get instance(): DynamicFormService {
        if (!DynamicFormServiceFactory.service) {
            const repository = new DynamicFormRepository();
            const schema = DynamicFormSchema;
            DynamicFormServiceFactory.service = new DynamicFormService(repository, schema);
        }
        return DynamicFormServiceFactory.service;
    }
}

export default DynamicFormServiceFactory
export {
    DynamicFormServiceFactory
}

