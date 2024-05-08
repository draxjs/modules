import RoleService from "../services/RoleService.js";
import RoleRepository from "../repository/RoleRepository.js";

const RoleServiceFactory = () : RoleService => {
    const roleRepository = new RoleRepository
    const roleService = new RoleService(roleRepository)
    return roleService
}

 export default RoleServiceFactory
