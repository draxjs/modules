import  {describe,it, beforeAll, afterAll} from "vitest"
import {equal} from "assert";
import RoleMongoRepository from "../../../src/repository/mongo/RoleMongoRepository";
import MongoInMemory from "../../setup/MongoInMemory";
import {IRole} from "../../../../identity-share/src/interfaces/IRole";
import {IDraxPaginateResult} from "@drax/crud-share";

describe("RoleRepositoryTest",  function() {

    const mongoInMemory = new MongoInMemory()
    const roleReposirory = new RoleMongoRepository()

    beforeAll(async () => {
        await mongoInMemory.connect()
       // console.log("BEFORE ROLE", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    afterAll(async () => {
        await mongoInMemory.dropAndClose()
        //console.log("AFTER ROLE", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    it("Create a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-mongo-role")).default
        let roleCreated: IRole = await roleReposirory.create(roleData)
        equal(roleCreated.name,roleData.name)
    })

    it("Update a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-mongo-role")).default
        roleData.name = "AdminUpdated"
        let roleUpdated: IRole = await roleReposirory.update(roleData._id, roleData)
        equal(roleUpdated.name,roleData.name)
    })


    it("Find role by ID successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-mongo-role")).default
        let role: IRole = await roleReposirory.findById(roleData._id)
        equal(role.name,roleData.name)
    })

    it("Retrieving all roles successfully.",  async function() {
        let roles: IRole[] = await roleReposirory.fetchAll()
        equal(roles.length,1)
    })

    it("Paginate roles successfully.",  async function() {
        let paginateRoles: IDraxPaginateResult<IRole> = await roleReposirory.paginate({page: 1, limit: 5})
        equal(paginateRoles.items.length,1)
        equal(paginateRoles.total,1)
        equal(paginateRoles.page,1)
        equal(paginateRoles.limit,5)
    })

    it("Delete a role successfully.",  async function() {
        let roleData = (await import("../../data-obj/roles/admin-mongo-role")).default
        let roleDeleted: Boolean = await roleReposirory.delete(roleData._id)
        equal(roleDeleted,true)
    })


})
