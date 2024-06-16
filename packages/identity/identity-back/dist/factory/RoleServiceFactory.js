import RoleService from "../services/RoleService.js";
import RoleRepository from "../repository/mongo/RoleRepository.js";
const RoleServiceFactory = () => {
    const roleRepository = new RoleRepository;
    const roleService = new RoleService(roleRepository);
    return roleService;
};
export default RoleServiceFactory;
