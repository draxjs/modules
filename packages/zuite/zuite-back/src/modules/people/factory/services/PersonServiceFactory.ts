
import PersonMongoRepository from '../../repository/mongo/PersonMongoRepository.js'
import PersonSqliteRepository from '../../repository/sqlite/PersonSqliteRepository.js'
import type {IPersonRepository} from "../../interfaces/IPersonRepository";
import {PersonService} from '../../services/PersonService.js'
import {PersonBaseSchema, PersonSchema} from "../../schemas/PersonSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class PersonServiceFactory {
    private static service: PersonService;

    public static get instance(): PersonService {
        if (!PersonServiceFactory.service) {
            
            let repository: IPersonRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new PersonMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new PersonSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = PersonBaseSchema;
            const fullSchema = PersonSchema;
            PersonServiceFactory.service = new PersonService(repository, baseSchema, fullSchema);
        }
        return PersonServiceFactory.service;
    }
}

export default PersonServiceFactory
export {
    PersonServiceFactory
}

