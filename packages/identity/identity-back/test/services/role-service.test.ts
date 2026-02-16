import  {describe,it, beforeAll, afterAll, assert} from "vitest"
import RoleService from "../../src/services/RoleService";
import MongoInMemory from "../setup/MongoInMemory";
import {IRole} from "../../../identity-share/src/interfaces/IRole";
import RoleMongoRepository from "../../src/repository/mongo/RoleMongoRepository";
import {IRoleRepository} from "../../src/interfaces/IRoleRepository";

describe("RoleServiceTest",  function() {
    let roleRepository: IRoleRepository = new RoleMongoRepository()
    let roleService = new RoleService(roleRepository)
    const mongoInMemory = new MongoInMemory()

    beforeAll(async () => {
        await mongoInMemory.connect()
        return
    })

    afterAll(async () => {
        await mongoInMemory.dropAndClose()
        return
    })

    it("should create role",  async function() {
        let roleData = (await import("../data-obj/roles/admin-mongo-role")).default
        let roleCreated: IRole = await roleService.create(roleData)
        assert.equal(roleCreated.name,roleData.name)
    })
})
