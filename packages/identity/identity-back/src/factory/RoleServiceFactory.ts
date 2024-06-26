import {DraxConfig} from "@drax/common-back"
import RoleService from "../services/RoleService.js";
import RoleMongoRepository from "../repository/mongo/RoleMongoRepository.js";
import RoleSqliteRepository from "../repository/sqlite/RoleSqliteRepository.js";
import {DbSetupUtils, DbEngine} from "../utils/DbSetupUtils.js";
import type {IRoleRepository} from "../interfaces/IRoleRepository";

let roleService: RoleService

const RoleServiceFactory = (verbose: boolean = false) : RoleService => {

    if(!roleService){
        let roleRepository: IRoleRepository

        switch (DbSetupUtils.getDbEngine()) {
            case DbEngine.Mongo:
                console.log("RoleServiceFactory DB ENGINE MONGODB")
                roleRepository = new RoleMongoRepository()
                break;
            case DbEngine.Sqlite:
                console.log("RoleServiceFactory DB ENGINE SQLITE")
                roleRepository = new RoleSqliteRepository(DbSetupUtils.getDbConfig(), verbose)
                break;
        }

        roleService = new RoleService(roleRepository)
    }

    return roleService
}

 export default RoleServiceFactory
