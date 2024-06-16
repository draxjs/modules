import RoleService from "../../src/services/RoleService.mjs";
import RoleRepository from "../../src/repository/mongo/RoleRepository.ts";
class RoleInitializer {
    static async initAdminRole() {
        const roleService = new RoleService(new RoleRepository());
        let roleData = (await import("../data-obj/roles/admin-role.mjs")).default;
        let roleCreated = await roleService.create(roleData);
        return roleCreated;
    }
}
export default RoleInitializer;
