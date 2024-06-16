import  {describe,it, before, after} from "node:test"
import {equal} from "assert";
import RoleRepository from "../../src/repository/mongo/RoleRepository";
import MongoInMemory from "../initializers/MongoInMemory";
import {IRole} from "../../src/interfaces/IRole";
import {PaginateResult} from "mongoose";

describe("RoleRepositoryTest",  function() {

    const roleReposirory = new RoleRepository()

    before(async () => {
        await MongoInMemory.connect()
       // console.log("BEFORE ROLE", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    after(async () => {
        await MongoInMemory.DropAndClose()
        //console.log("AFTER ROLE", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    it("Create a role successfully.",  async function() {
        let roleData = (await import("../data-obj/roles/admin-role")).default
        let roleCreated: IRole = await roleReposirory.create(roleData)
        equal(roleCreated.name,roleData.name)
    })

    it("Update a role successfully.",  async function() {
        let roleData = (await import("../data-obj/roles/admin-role")).default
        roleData.name = "AdminUpdated"
        let roleUpdated: IRole = await roleReposirory.update(roleData.id, roleData)
        equal(roleUpdated.name,roleData.name)
    })




    it("Find role by ID successfully.",  async function() {
        let roleData = (await import("../data-obj/roles/admin-role")).default
        let role: IRole = await roleReposirory.findById(roleData.id)
        equal(role.name,roleData.name)
    })

    it("Retrieving all roles successfully.",  async function() {
        let roles: IRole[] = await roleReposirory.fetch()
        equal(roles.length,1)
    })

    it("Paginate roles successfully.",  async function() {
        let paginateRoles: PaginateResult<IRole> = await roleReposirory.paginate()
        equal(paginateRoles.docs.length,1)
        equal(paginateRoles.totalDocs,1)
        equal(paginateRoles.page,1)
    })

    it("Delete a role successfully.",  async function() {
        let roleData = (await import("../data-obj/roles/admin-role")).default
        let roleDeleted: Boolean = await roleReposirory.delete(roleData.id)
        equal(roleDeleted,true)
    })

    it("Fail create role when name has two spaces",  async function() {
        let roleData = (await import("../data-obj/roles/admin-role")).default
        roleData.name = "Admin  Role"
        try{
            let roleCreated: IRole = await roleReposirory.create(roleData)
            equal("Not error throw it","Error expected")
        }catch (e) {
            equal(e.errors['name'].message,"Role name cant contain two spaces")
        }

    })
})
