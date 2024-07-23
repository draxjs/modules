import RoleService from "../../src/services/RoleService";
import {IRole} from "../../../identity-share/src/interfaces/IRole";
import RoleMongoRepository from "../../src/repository/mongo/RoleMongoRepository";

class RoleMongoInitializer {

    static async initAdminRole(): Promise<IRole>{
        const roleService = new RoleService(new RoleMongoRepository())
        let roleData = (await import("../data-obj/roles/admin-mongo-role")).default
        let roleCreated = await roleService.create(roleData)
        return roleCreated
    }
}

export default RoleMongoInitializer
export {RoleMongoInitializer}
