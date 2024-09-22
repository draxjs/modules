
import PersonRepository from '../repository/PersonRepository.js'
import {PersonService} from '../services/PersonService.js'


class PersonServiceFactory {
    private static service: PersonService;

    public static get instance(): PersonService {
        if (!PersonServiceFactory.service) {
            const repository = new PersonRepository();
            PersonServiceFactory.service = new PersonService(repository);
        }
        return PersonServiceFactory.service;
    }
}

export default PersonServiceFactory
export {
    PersonServiceFactory
}

