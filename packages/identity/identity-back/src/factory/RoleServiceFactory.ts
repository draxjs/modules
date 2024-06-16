import RoleService from "../services/RoleService.js";
import RoleMongoRepository from "../repository/mongo/RoleMongoRepository.js";
import RoleSqliteRepository from "../repository/sqlite/RoleSqliteRepository.js";

const RoleServiceFactory = () : RoleService => {

    let roleRepository
    if(process.env.SQLITE_DATABASE){
        roleRepository = new RoleSqliteRepository(process.env.SQLITE_DATABASE, false)
        roleRepository.table()
    }else{
        roleRepository = new RoleMongoRepository()
    }

    const roleService = new RoleService(roleRepository)
    return roleService
}

 export default RoleServiceFactory
