import  {describe,it, beforeAll, afterAll} from "vitest"
import {equal} from "assert";
import {IRole} from "../../../../identity-share/src/interfaces/IRole";
import {IDraxPaginateResult} from "@drax/crud-share";
import RoleSqliteRepository from "../../../src/repository/sqlite/RoleSqliteRepository";
import {UUID} from "crypto";

describe("RoleRepositoryTest",  function() {

    const repository = new RoleSqliteRepository("test.db", true)

    beforeAll(async () => {
        repository.build()
        return
    })

    afterAll(async () => {
        //await repository.deleteAll()
        return
    })

    it("Delete All.",  async function() {
        let r = await repository.deleteAll()
        equal(r,true)
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
        let role: IRole = await repository.findById(roleData._id as UUID)
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
        let roleUpdated: IRole = await repository.update(roleData._id as UUID, roleData)
        equal(roleUpdated.name,roleData.name)
    })

    it("UpdatePartial a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
       let partial = {name: "AdminUpdatedPartial"}
        let roleUpdated: IRole = await repository.updatePartial(roleData._id as UUID, partial)
        equal(roleUpdated.name,'AdminUpdatedPartial')
    })

    it("Delete a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-sqlite-role")).default
        let roleDeleted: Boolean = await repository.delete(roleData._id as UUID)
        equal(roleDeleted,true)
    })


})
