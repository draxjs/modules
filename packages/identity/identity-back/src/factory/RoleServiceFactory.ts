import RoleService from "../services/RoleService.js";
import RoleMongoRepository from "../repository/mongo/RoleMongoRepository.js";
import RoleSqliteRepository from "../repository/sqlite/RoleSqliteRepository.js";
import {DbSetupUtils, DbEngine} from "../utils/DbSetupUtils.js";
import type {IRoleRepository} from "../interfaces/IRoleRepository";

const RoleServiceFactory = () : RoleService => {

    let roleRepository: IRoleRepository

    switch (DbSetupUtils.getDbEngine()) {
        case DbEngine.Mongo:
            console.log("RoleServiceFactory DB ENGINE MONGODB")
            roleRepository = new RoleMongoRepository()
            break;
        case DbEngine.Sqlite:
            console.log("RoleServiceFactory DB ENGINE SQLITE")
            roleRepository = new RoleSqliteRepository(process.env.SQLITE_DATABASE, false)
            roleRepository.table()
            break;
    }

    const roleService = new RoleService(roleRepository)
    return roleService
}

 export default RoleServiceFactory()
