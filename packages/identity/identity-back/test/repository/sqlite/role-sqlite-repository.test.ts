import  {describe,it, before, after} from "node:test"
import {equal} from "assert";
import {IRole} from "../../../src/interfaces/IRole";
import {IPaginateResult} from "@drax/common-back";
import RoleSqliteRepository from "../../../src/repository/sqlite/RoleSqliteRepository";
import {UUID} from "crypto";

describe("RoleRepositoryTest",  function() {

    const roleReposirory = new RoleSqliteRepository("test.db", false)

    before(async () => {
        roleReposirory.table()
        return
    })

    after(async () => {
        await roleReposirory.deleteAll()
        return
    })

    it("Create a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        let roleCreated: IRole = await roleReposirory.create(roleData)
        equal(roleCreated.name,roleData.name)
    })

    it("Find role by ID successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        let role: IRole = await roleReposirory.findById(roleData.id as UUID)
        equal(role.name,roleData.name)
    })



    it("Retrieving all roles successfully.",  async function() {
        let roles: IRole[] = await roleReposirory.fetchAll()
        equal(roles.length,1)
    })

    it("Paginate roles successfully.",  async function() {
        let paginateRoles: IPaginateResult = await roleReposirory.paginate(1,5)
        equal(paginateRoles.items.length,1)
        equal(paginateRoles.total,1)
        equal(paginateRoles.page,1)
        equal(paginateRoles.limit,5)
    })

    it("Update a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        roleData.name = "AdminUpdated"
        let roleUpdated: IRole = await roleReposirory.update(roleData.id as UUID, roleData)
        equal(roleUpdated.name,roleData.name)
    })

    it("Delete a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        let roleDeleted: Boolean = await roleReposirory.delete(roleData.id as UUID)
        equal(roleDeleted,true)
    })


})
