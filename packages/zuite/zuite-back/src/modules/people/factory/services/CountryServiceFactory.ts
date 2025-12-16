
import CountryMongoRepository from '../../repository/mongo/CountryMongoRepository.js'
import CountrySqliteRepository from '../../repository/sqlite/CountrySqliteRepository.js'
import type {ICountryRepository} from "../../interfaces/ICountryRepository";
import {CountryService} from '../../services/CountryService.js'
import {CountryBaseSchema} from "../../schemas/CountrySchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class CountryServiceFactory {
    private static service: CountryService;

    public static get instance(): CountryService {
        if (!CountryServiceFactory.service) {
            
            let repository: ICountryRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CountryMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new CountrySqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const schema = CountryBaseSchema;
            CountryServiceFactory.service = new CountryService(repository, schema);
        }
        return CountryServiceFactory.service;
    }
}

export default CountryServiceFactory
export {
    CountryServiceFactory
}

