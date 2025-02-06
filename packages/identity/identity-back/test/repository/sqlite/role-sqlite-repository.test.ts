import  {describe,it, before, after} from "node:test"
import {equal} from "assert";
import {IRole} from "../../../../identity-share/src/interfaces/IRole";
import {IDraxPaginateResult} from "@drax/crud-share";
import RoleSqliteRepository from "../../../src/repository/sqlite/RoleSqliteRepository";
import {UUID} from "crypto";

describe("RoleRepositoryTest",  function() {

    const repository = new RoleSqliteRepository("test.db", false)

    before(async () => {
        repository.table()
        return
    })

    after(async () => {
        await repository.deleteAll()
        return
    })

    it("Create a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        let roleCreated: IRole = await repository.create(roleData)
        equal(roleCreated.name,roleData.name)
    })

    it("Create a second role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/operator-sqlite-role")).default
        let roleCreated: IRole = await repository.create(roleData)
        equal(roleCreated.name,roleData.name)
    })

    it("Find role by ID successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        let role: IRole = await repository.findById(roleData.id as UUID)
        equal(role.name,roleData.name)
    })



    it("Retrieving all roles successfully.",  async function() {
        let roles: IRole[] = await repository.fetchAll()
        equal(roles.length,2)
    })

    it("Paginate roles successfully.",  async function() {
        let paginateRoles: IDraxPaginateResult<IRole> = await repository.paginate({page: 1, limit: 5})
        console.log(paginateRoles)
        equal(paginateRoles.items.length,2)
        equal(paginateRoles.total,2)
        equal(paginateRoles.page,1)
        equal(paginateRoles.limit,5)
    })

    it("Update a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        roleData.name = "AdminUpdated"
        let roleUpdated: IRole = await repository.update(roleData.id as UUID, roleData)
        equal(roleUpdated.name,roleData.name)
    })

    it("Delete a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        let roleDeleted: Boolean = await repository.delete(roleData.id as UUID)
        equal(roleDeleted,true)
    })


})
