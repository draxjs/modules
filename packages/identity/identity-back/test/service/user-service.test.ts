import  {before, after, describe, it} from "node:test"
import assert from "assert";
import UserService from "../../src/services/UserService";
import MongoInMemory from "../db/MongoInMemory";
import RoleMongoInitializer from "../initializers/RoleMongoInitializer";
import {IRole} from "../../src/interfaces/IRole";
import {IUser} from "../../src/interfaces/IUser";
import UserMongoRepository from "../../src/repository/mongo/UserMongoRepository";
import {IUserRepository} from "../../src/interfaces/IUserRepository";
import {ValidationError} from "@drax/common-back";

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

    it("should createUser user", async function () {
        let userCreated = await userService.create(userAdminData)
        assert.equal(userCreated.username, userAdminData.username)
    })

    it("should fail createUser user with short password", async function () {
        let userData = {...userAdminData, password: "123"}
        await assert.rejects(
            async () => {
                await userService.create(userData)
            },
            (err) => {
                assert(err instanceof ValidationError, 'Expected error to be instance of UniqueError');
                assert.strictEqual(err.errors[0].field, 'password');
                assert.strictEqual(err.errors[0].reason, 'Password must be more than 8 characters');
                return true;
            },
        );
    })

    it("should find one user", async function () {
        let user = await userService.findById(userAdminData._id)
        assert.equal(user.username, userAdminData.username)
    })
})
