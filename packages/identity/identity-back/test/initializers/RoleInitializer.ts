import RoleService from "../../src/services/RoleService";
import {IRole} from "../../src/interfaces/IRole";
import RoleRepository from "../../src/repository/mongo/RoleRepository";

class RoleInitializer{

    static async initAdminRole(): Promise<IRole>{
        const roleService = new RoleService(new RoleRepository())
        let roleData = (await import("../data-obj/roles/admin-role")).default
        let roleCreated = await roleService.create(roleData)
        return roleCreated
    }
}

export default RoleInitializer
