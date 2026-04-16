
import AILogMongoRepository from '../../repository/mongo/AILogMongoRepository.js'
import AILogSqliteRepository from '../../repository/sqlite/AILogSqliteRepository.js'
import type {IAILogRepository} from "../../interfaces/IAILogRepository";
import {AILogService} from '../../services/AILogService.js'
import {AILogBaseSchema, AILogSchema} from "../../schemas/AILogSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class AILogServiceFactory {
    private static service: AILogService;

    public static get instance(): AILogService {
        if (!AILogServiceFactory.service) {
            
            let repository: IAILogRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new AILogMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new AILogSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = AILogBaseSchema;
            const fullSchema = AILogSchema;
            AILogServiceFactory.service = new AILogService(repository, baseSchema, fullSchema);
        }
        return AILogServiceFactory.service;
    }
}

export default AILogServiceFactory
export {
    AILogServiceFactory
}

