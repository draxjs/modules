
import CovenantMongoRepository from '../../repository/mongo/CovenantMongoRepository.js'
import CovenantSqliteRepository from '../../repository/sqlite/CovenantSqliteRepository.js'
import type {ICovenantRepository} from "../../interfaces/ICovenantRepository";
import {CovenantService} from '../../services/CovenantService.js'
import {CovenantBaseSchema, CovenantSchema} from "../../schemas/CovenantSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class CovenantServiceFactory {
    private static service: CovenantService;

    public static get instance(): CovenantService {
        if (!CovenantServiceFactory.service) {
            
            let repository: ICovenantRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CovenantMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new CovenantSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = CovenantBaseSchema;
            const fullSchema = CovenantSchema;
            CovenantServiceFactory.service = new CovenantService(repository, baseSchema, fullSchema);
        }
        return CovenantServiceFactory.service;
    }
}

export default CovenantServiceFactory
export {
    CovenantServiceFactory
}

