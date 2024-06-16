import RoleService from "../../src/services/RoleService";
import {IRole} from "../../src/interfaces/IRole";
import RoleSqliteRepository from "../../src/repository/sqlite/RoleSqliteRepository";
import {UUID} from "crypto";


async function RoleSqliteInitializer(): Promise<IRole> {
    const roleRespository = new RoleSqliteRepository('test.db', true)
    let roleData = (await import("../data-obj/roles/admin-sqlite-role")).default

    let role = await roleRespository.findById(roleData.id as UUID)
    if (!role) {
        role = await roleRespository.create(roleData)
    }
    return role
}

export default RoleSqliteInitializer
