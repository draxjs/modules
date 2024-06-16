import  {before, after, describe, it} from "node:test"
import assert from "assert";
import UserService from "../../src/services/UserService";
import MongoInMemory from "../db/MongoInMemory";
import RoleMongoInitializer from "../initializers/RoleMongoInitializer";
import {IRole} from "../../src/interfaces/IRole";
import {IUser} from "../../src/interfaces/IUser";
import UserMongoRepository from "../../src/repository/mongo/UserMongoRepository";
import {IUserRepository} from "../../src/interfaces/IUserRepository";

describe("UserServiceTest", function () {
    let userRepository: IUserRepository = new UserMongoRepository()
    let userService = new UserService(userRepository)
    let adminRole: IRole
    let userAdminData: any

    before(async () => {
        await MongoInMemory.connect()
        adminRole = await RoleMongoInitializer.initAdminRole()
        userAdminData = (await import("../data-obj/users/root-mongo-user")).default
        console.log("BEFORE USER", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    after(async () => {
        await MongoInMemory.DropAndClose()
        console.log("AFTER USER", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    it("should create user", async function () {

        let userCreated = await userService.create(userAdminData)

        assert.equal(userCreated.username, userAdminData.username)
    })

    it("should find one user", async function () {
        let user = await userService.findById(userAdminData._id)
        assert.equal(user.username, userAdminData.username)
    })
})
