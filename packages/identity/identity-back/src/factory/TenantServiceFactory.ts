import {DraxConfig} from "@drax/common-back"
import TenantService from "../services/TenantService.js";
import TenantMongoRepository from "../repository/mongo/TenantMongoRepository.js";
import TenantSqliteRepository from "../repository/sqlite/TenantSqliteRepository.js";
import {DbSetupUtils, DbEngine} from "../utils/DbSetupUtils.js";
import type {ITenantRepository} from "../interfaces/ITenantRepository";

let tenantService: TenantService

const TenantServiceFactory = (verbose: boolean = false) : TenantService => {

    if(!tenantService){
        let tenantRepository: ITenantRepository

        switch (DbSetupUtils.getDbEngine()) {
            case DbEngine.Mongo:
                console.log("TenantServiceFactory DB ENGINE MONGODB")
                tenantRepository = new TenantMongoRepository()
                break;
            case DbEngine.Sqlite:
                console.log("TenantServiceFactory DB ENGINE SQLITE")
                tenantRepository = new TenantSqliteRepository(DbSetupUtils.getDbConfig(), verbose)
                break;
        }

        tenantService = new TenantService(tenantRepository)
    }

    return tenantService
}

 export default TenantServiceFactory
