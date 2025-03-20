import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back"
import TenantService from "../services/TenantService.js";
import TenantMongoRepository from "../repository/mongo/TenantMongoRepository.js";
import TenantSqliteRepository from "../repository/sqlite/TenantSqliteRepository.js";
import type {ITenantRepository} from "../interfaces/ITenantRepository";

let tenantService: TenantService

const TenantServiceFactory = (verbose: boolean = false): TenantService => {

    if (!tenantService) {
        let tenantRepository: ITenantRepository

        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                tenantRepository = new TenantMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                tenantRepository = new TenantSqliteRepository(dbFile, verbose)
                tenantRepository.build()
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        tenantService = new TenantService(tenantRepository)
    }

    return tenantService
}

export default TenantServiceFactory
