import RoleService from "../services/RoleService.js";
import RoleRepository from "../repository/mongo/RoleRepository.js";
import RoleSqliteRepository from "../repository/sqlite/RoleSqliteRepository.js";
const RoleServiceFactory = () => {
    let roleRepository;
    if (process.env.SQLITE_DATABASE) {
        roleRepository = new RoleSqliteRepository();
    }
    else {
        roleRepository = new RoleRepository();
    }
    const roleService = new RoleService(roleRepository);
    return roleService;
};
export default RoleServiceFactory;
