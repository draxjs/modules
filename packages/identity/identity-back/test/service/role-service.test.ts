import  {describe,it, before, after} from "node:test"
import assert from "assert";
import RoleService from "../../src/services/RoleService";
import MongoInMemory from "../db/MongoInMemory";
import {IRole} from "../../../identity-share/src/interfaces/IRole";
import RoleMongoRepository from "../../src/repository/mongo/RoleMongoRepository";
import {IRoleRepository} from "../../src/interfaces/IRoleRepository";

describe("RoleServiceTest",  function() {
    let roleRepository: IRoleRepository = new RoleMongoRepository()
    let roleService = new RoleService(roleRepository)
    before(async () => {
        await MongoInMemory.connect()
        console.log("BEFORE ROLE", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    after(async () => {
        await MongoInMemory.DropAndClose()
        console.log("AFTER ROLE", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    it("should create role",  async function() {
        let roleData = (await import("../data-obj/roles/admin-mongo-role")).default
        let roleCreated: IRole = await roleService.create(roleData)

        assert.equal(roleCreated.name,roleData.name)
    })
})
