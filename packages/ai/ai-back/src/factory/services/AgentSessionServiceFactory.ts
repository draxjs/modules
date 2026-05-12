
import AgentSessionMongoRepository from '../../repository/mongo/AgentSessionMongoRepository.js'
import AgentSessionSqliteRepository from '../../repository/sqlite/AgentSessionSqliteRepository.js'
import type {IAgentSessionRepository} from "../../interfaces/IAgentSessionRepository";
import {AgentSessionService} from '../../services/AgentSessionService.js'
import {AgentSessionBaseSchema, AgentSessionSchema} from "../../schemas/AgentSessionSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class AgentSessionServiceFactory {
    private static service: AgentSessionService;

    public static get instance(): AgentSessionService {
        if (!AgentSessionServiceFactory.service) {
            
            let repository: IAgentSessionRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new AgentSessionMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new AgentSessionSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = AgentSessionBaseSchema;
            const fullSchema = AgentSessionSchema;
            AgentSessionServiceFactory.service = new AgentSessionService(repository, baseSchema, fullSchema);
        }
        return AgentSessionServiceFactory.service;
    }
}

export default AgentSessionServiceFactory
export {
    AgentSessionServiceFactory
}

