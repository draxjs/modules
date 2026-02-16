import { beforeAll, afterAll, describe, it, expect } from "vitest"
import UserService from "../../src/services/UserService";
import MongoInMemory from "../setup/MongoInMemory";
import RoleMongoInitializer from "../initializers/RoleMongoInitializer";
import {IRole} from "../../../identity-share/src/interfaces/IRole";
import UserMongoRepository from "../../src/repository/mongo/UserMongoRepository";
import {IUserRepository} from "../../src/interfaces/IUserRepository";
import {ValidationError} from "@drax/common-back";

describe("UserServiceTest", function () {
    let userRepository: IUserRepository = new UserMongoRepository()
    let userService = new UserService(userRepository)
    let adminRole: IRole
    let userAdminData: any
    let mongoInMemory: MongoInMemory = new MongoInMemory()

    beforeAll(async () => {
        await mongoInMemory.connect()
        adminRole = await RoleMongoInitializer.initAdminRole()
        userAdminData = (await import("../data-obj/users/root-mongo-user")).default
        return
    })

    afterAll(async () => {
        await mongoInMemory.dropAndClose()
        return
    })

    it("should create user", async function () {
        const userData = {...userAdminData}
        let userCreated = await userService.create(userData)
        expect(userCreated.username).toBe(userAdminData.username)
    })


    it("should find one user", async function () {
        let user = await userService.findById(userAdminData._id)
        expect(user.username).toBe(userAdminData.username)
    })

    it("should modify user", async function () {
        const userData = {...userAdminData}
        const newName = "AdminUpdated"
        userData.name = newName
        let userUpdated = await userService.update(userAdminData._id, userData)
        expect(userUpdated.name).toBe(newName)
    })

    it("should fail create user with short password", async function () {
        let userData = {...userAdminData, password: "123"}

        await expect(async () => {
            await userService.create(userData)
        }).rejects.toSatisfy((err) => {
            expect(err).toBeInstanceOf(ValidationError)
            expect(err.errors[0].field).toBe('password')
            expect(err.errors[0].reason).toBe('validation.password.min8')
            return true;
        });
    })


    it("should changeUserPassword user", async function () {
        const userId = userAdminData._id
        const newPassword = "123"
        let userPasswordChanged = await userService.changeUserPassword(userId, newPassword)
        expect(userPasswordChanged._id.toString()).toBe(userId)
    })



})
