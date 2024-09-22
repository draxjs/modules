
import CountryRepository from '../repository/CountryRepository.js'
import {CountryService} from '../services/CountryService.js'
import {CountrySchema} from "../schemas/CountrySchema.js";

class CountryServiceFactory {
    private static service: CountryService;

    public static get instance(): CountryService {
        if (!CountryServiceFactory.service) {
            const repository = new CountryRepository();
            const schema = CountrySchema;
            CountryServiceFactory.service = new CountryService(repository, schema);
        }
        return CountryServiceFactory.service;
    }
}

export default CountryServiceFactory
export {
    CountryServiceFactory
}

