
import PersonRepository from '../../repository/PersonRepository.js'
import {PersonService} from '../../services/PersonService.js'
import {PersonBaseSchema} from "../../schemas/PersonSchema.js";

class PersonServiceFactory {
    private static service: PersonService;

    public static get instance(): PersonService {
        if (!PersonServiceFactory.service) {
            const repository = new PersonRepository();
            const schema = PersonBaseSchema;
            PersonServiceFactory.service = new PersonService(repository, schema);
        }
        return PersonServiceFactory.service;
    }
}

export default PersonServiceFactory
export {
    PersonServiceFactory
}

