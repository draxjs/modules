import RoleService from "../../src/services/RoleService";
import {IRole} from "../../src/interfaces/IRole";
import RoleMongoRepository from "../../src/repository/mongo/RoleMongoRepository";

class RoleInitializer{

    static async initAdminRole(): Promise<IRole>{
        const roleService = new RoleService(new RoleMongoRepository())
        let roleData = (await import("../data-obj/roles/admin-mongo-role")).default
        let roleCreated = await roleService.create(roleData)
        return roleCreated
    }
}

export default RoleInitializer
