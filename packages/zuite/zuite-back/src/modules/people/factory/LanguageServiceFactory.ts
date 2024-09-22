
import LanguageRepository from '../repository/LanguageRepository.js'
import {LanguageService} from '../services/LanguageService.js'
import {LanguageSchema} from "../schemas/LanguageSchema.js";

class LanguageServiceFactory {
    private static service: LanguageService;

    public static get instance(): LanguageService {
        if (!LanguageServiceFactory.service) {
            const repository = new LanguageRepository();
            const schema = LanguageSchema;
            LanguageServiceFactory.service = new LanguageService(repository, schema);
        }
        return LanguageServiceFactory.service;
    }
}

export default LanguageServiceFactory
export {
    LanguageServiceFactory
}

