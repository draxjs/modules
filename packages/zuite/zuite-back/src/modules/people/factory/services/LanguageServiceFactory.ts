
import LanguageMongoRepository from '../../repository/mongo/LanguageMongoRepository.js'
import LanguageSqliteRepository from '../../repository/sqlite/LanguageSqliteRepository.js'
import type {ILanguageRepository} from "../../interfaces/ILanguageRepository";
import {LanguageService} from '../../services/LanguageService.js'
import {LanguageBaseSchema, LanguageSchema} from "../../schemas/LanguageSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class LanguageServiceFactory {
    private static service: LanguageService;

    public static get instance(): LanguageService {
        if (!LanguageServiceFactory.service) {
            
            let repository: ILanguageRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new LanguageMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new LanguageSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = LanguageBaseSchema;
            const fullSchema = LanguageSchema;
            LanguageServiceFactory.service = new LanguageService(repository, baseSchema, fullSchema);
        }
        return LanguageServiceFactory.service;
    }
}

export default LanguageServiceFactory
export {
    LanguageServiceFactory
}

