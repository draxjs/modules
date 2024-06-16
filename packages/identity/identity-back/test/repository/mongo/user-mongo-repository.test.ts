import  {before, after, describe, it, test} from "node:test"
import assert, {equal} from "assert";
import UserMongoRepository from "../../../src/repository/mongo/UserMongoRepository";
import MongoInMemory from "../../db/MongoInMemory";
import RoleMongoInitializer from "../../initializers/RoleMongoInitializer";
import {IRole} from "../../../src/interfaces/IRole";
import {IUser} from "../../../src/interfaces/IUser";
import type {IPaginateResult} from "@drax/common-back";
import {mongoose, ValidationError} from "@drax/common-back";


test.describe("UserRepositoryTest", function () {

    let userRepository = new UserMongoRepository()
    let adminRole: IRole
    let userAdminData: IUser

    before(async () => {
        await MongoInMemory.connect()
        adminRole = await RoleMongoInitializer.initAdminRole()

        //console.log("BEFORE USER", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    after(async () => {
        await MongoInMemory.DropAndClose()
        //console.log("AFTER USER", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    test("Create mongo user successfully", async function () {
        userAdminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userCreated = await userRepository.create(userAdminData)
       equal(userCreated.username, userAdminData.username)
    })

    test("Create mongo user fail same id", async function () {
        userAdminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userData = {...userAdminData, email: "asd123@asd123.com", username: "asd123"}


        await assert.rejects(
            async () => {
                await userRepository.create(userData)
            },
            (error) => {
                assert(error instanceof ValidationError, 'Expected error to be instance of ValidationError');
                assert.strictEqual(error.errors[0].entity, 'User');
                assert.strictEqual(error.errors[0].field, '_id');
                return true;
            },
        );
    })

    test("Create mongo user fail same username", async function () {
        userAdminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userData = {...userAdminData, _id: new mongoose.Types.ObjectId("646a661e44c93567c23d8d69"),email: "asd123@asd123.com" }


        await assert.rejects(
            async () => {
                await userRepository.create(userData)
            },
            (error) => {
                assert(error instanceof ValidationError, 'Expected error to be instance of ValidationError');
                assert.strictEqual(error.errors[0].entity, 'User');
                assert.strictEqual(error.errors[0].field, 'username');
                return true;
            },
        );
    })

    test("Update mongo user successfully.",  async function() {
        let adminData = (await import("../../data-obj/users/root-mongo-user")).default
        adminData.name = "AdminUpdated"
        let userUpdated: IUser = await userRepository.update(adminData._id, adminData)
        equal(userUpdated.name,userUpdated.name)
    })

    test("Find mongo user by ID successfully", async function () {
        let adminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userFound = await userRepository.findById(adminData._id)
        equal(userFound.username, userAdminData.username)
    })

    test("Find mongo user by username successfully", async function () {
        let adminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userFound = await userRepository.findByUsername(adminData.username)
        equal(userFound.username, userAdminData.username)
    })


    test("Paginate mongo users successfully.",  async function() {
        let paginateUsers: IPaginateResult = await userRepository.paginate()
        equal(paginateUsers.items.length,1)
        equal(paginateUsers.total,1)
        equal(paginateUsers.page,1)
    })
})
