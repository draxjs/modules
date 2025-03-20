import {DraxConfig, CommonConfig, COMMON} from "@drax/common-back"
import RoleService from "../services/RoleService.js";
import RoleMongoRepository from "../repository/mongo/RoleMongoRepository.js";
import RoleSqliteRepository from "../repository/sqlite/RoleSqliteRepository.js";
import type {IRoleRepository} from "../interfaces/IRoleRepository";

let roleService: RoleService

const RoleServiceFactory = (verbose: boolean = false): RoleService => {

    if (!roleService) {
        let roleRepository: IRoleRepository

        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                roleRepository = new RoleMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                roleRepository = new RoleSqliteRepository(dbFile, verbose)
                roleRepository.build()
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        roleService = new RoleService(roleRepository)
    }

    return roleService
}

export default RoleServiceFactory
