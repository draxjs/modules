import type {IDashboardRepository} from '../../interfaces/IDashboardRepository'
import DashboardMongoRepository from '../../repository/mongo/DashboardMongoRepository.js'
import DashboardSqliteRepository from '../../repository/sqlite/DashboardSqliteRepository.js'
import {DashboardService} from '../../services/DashboardService.js'
import {DashboardBaseSchema} from "../../schemas/DashboardSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";


class DashboardServiceFactory {
    private static service: DashboardService;

    public static get instance(): DashboardService {
        if (!DashboardServiceFactory.service) {


            let repository: IDashboardRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new DashboardMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new DashboardSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            const schema = DashboardBaseSchema;
            DashboardServiceFactory.service = new DashboardService(repository, schema);
        }
        return DashboardServiceFactory.service;
    }
}

export default DashboardServiceFactory
export {
    DashboardServiceFactory
}

