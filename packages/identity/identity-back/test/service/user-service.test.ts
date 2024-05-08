import  {before, after, describe, it} from "node:test"
import assert from "assert";
import UserService from "../../src/services/UserService";
import MongoInMemory from "../initializers/MongoInMemory";
import RoleInitializer from "../initializers/RoleInitializer";
import {IRole} from "../../src/interfaces/IRole";
import {IUser} from "../../src/interfaces/IUser";
import UserRepository from "../../src/repository/UserRepository";
import {IUserRepository} from "../../src/interfaces/IUserRepository";

describe("UserServiceTest", function () {
    let userRepository: IUserRepository = new UserRepository()
    let userService = new UserService(userRepository)
    let adminRole: IRole
    let userAdminData: IUser

    before(async () => {
        await MongoInMemory.connect()
        adminRole = await RoleInitializer.initAdminRole()
        userAdminData = (await import("../data-obj/users/root-user")).default
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
        let userCreated = await userService.findById(userAdminData._id)


        assert.equal(userCreated.username, userAdminData.username)
    })
})
