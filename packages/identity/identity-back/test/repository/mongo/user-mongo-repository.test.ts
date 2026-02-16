import {beforeAll, afterAll, describe, test, expect, assert} from "vitest"
import UserMongoRepository from "../../../src/repository/mongo/UserMongoRepository";
import MongoInMemory from "../../setup/MongoInMemory";
import RoleMongoInitializer from "../../initializers/RoleMongoInitializer";
import {IUser} from "../../../../identity-share/src/interfaces/IUser";
import type {IDraxPaginateResult} from "@drax/crud-share";
import {mongoose, ValidationError} from "@drax/common-back";


describe("UserRepositoryTest", function () {

    let userRepository = new UserMongoRepository()
    let adminRole
    let userAdminData
    const mongoInMemory = new MongoInMemory()

    beforeAll(async () => {
        await mongoInMemory.connect()
        adminRole = await RoleMongoInitializer.initAdminRole()

        //console.log("BEFORE USER", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    afterAll(async () => {
        await mongoInMemory.dropAndClose()
        //console.log("AFTER USER", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    test("Create mongo user successfully", async function () {
        userAdminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userCreated = await userRepository.create(userAdminData)
        expect(userCreated.username).toBe(userAdminData.username)
    })

    test("Create mongo user fail same id", async function () {
        userAdminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userData = {...userAdminData, email: "asd123@asd123.com", username: "asd123"}

        await expect(
            userRepository.create(userData)
        ).rejects.toThrow(ValidationError)

        try {
            await userRepository.create(userData)
        } catch (error) {
            assert(error instanceof ValidationError)
            expect(error.errors[0].field).toBe('_id')
        }
    })

    test("Create mongo user fail same username", async function () {
        userAdminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userData = {...userAdminData, _id: new mongoose.Types.ObjectId("646a661e44c93567c23d8d69"),email: "asd123@asd123.com" }

        try {
            await userRepository.create(userData)
        } catch (error) {
            assert(error instanceof ValidationError)
            expect(error.errors[0].field).toBe('username')
            expect(error.errors[0].reason).toBe('validation.unique')
        }
    })

    test("Create mongo user fail if role doesnt exist", async function () {
        userAdminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userData = {...userAdminData,
            _id: '646a661e44c93567c23d8d56',
            email: "a456@asd567.com",
            username: "rolenotexist",
            role: "646a661e44c93567c23d8d89"
        }

        try {
            await userRepository.create(userData)
        } catch (error) {
            assert(error instanceof ValidationError)
            expect(error.errors[0].field).toBe('role')
            expect(error.errors[0].reason).toBe('validation.notfound')
        }
    })

    test("Update mongo user successfully.",  async function() {
        let adminData = (await import("../../data-obj/users/root-mongo-user")).default
        adminData.name = "AdminUpdated"
        let userUpdated: IUser = await userRepository.update(adminData._id, adminData)
        expect(userUpdated.name).toBe(userUpdated.name)
    })

    test("Find mongo user by ID successfully", async function () {
        let adminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userFound = await userRepository.findById(adminData._id)
        console.log("userFound",userFound)
        expect(userFound.username).toBe(userAdminData.username)
        expect(userFound).toBeInstanceOf(Object)
    })

    test("Find mongo user by username successfully", async function () {
        let adminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userFound = await userRepository.findByUsername(adminData.username)
        expect(userFound.username).toBe(userAdminData.username)
    })

    test("Paginate mongo users successfully.",  async function() {
        let paginateUsers: IDraxPaginateResult<IUser> = await userRepository.paginate({page: 1, limit: 5})
        expect(paginateUsers.items.length).toBe(1)
        expect(paginateUsers.total).toBe(1)
        expect(paginateUsers.page).toBe(1)
    })
})
