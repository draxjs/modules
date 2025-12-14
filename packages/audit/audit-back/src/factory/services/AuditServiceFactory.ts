
import AuditMongoRepository from '../../repository/mongo/AuditMongoRepository.js'
import AuditSqliteRepository from "../../repository/sqlite/AuditSqliteRepository.js";
import type {IAuditRepository} from "../../interfaces/IAuditRepository";
import {AuditService} from '../../services/AuditService.js'
import {AuditBaseSchema} from "../../schemas/AuditSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class AuditServiceFactory {
    private static service: AuditService;

    public static get instance(): AuditService {
        if (!AuditServiceFactory.service) {
            let repository: IAuditRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new AuditMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new AuditSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const schema = AuditBaseSchema;
            AuditServiceFactory.service = new AuditService(repository, schema);
        }
        return AuditServiceFactory.service;
    }
}

export default AuditServiceFactory
export {
    AuditServiceFactory
}

