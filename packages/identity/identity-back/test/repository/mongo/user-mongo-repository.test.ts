import  {before, after, describe, it, test} from "node:test"
import assert, {equal} from "assert";
import UserMongoRepository from "../../../src/repository/mongo/UserMongoRepository";
import MongoInMemory from "../../db/MongoInMemory";
import RoleMongoInitializer from "../../initializers/RoleMongoInitializer";
import {IUser} from "../../../../identity-share/src/interfaces/IUser";
import type {IPaginateResult} from "@drax/common-back";
import {mongoose, ValidationError} from "@drax/common-back";


test.describe("UserRepositoryTest", function () {

    let userRepository = new UserMongoRepository()
    let adminRole
    let userAdminData

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
                assert.strictEqual(error.errors[0].field, 'username');
                assert.strictEqual(error.errors[0].reason, 'validation.unique');
                return true;
            },
        );
    })

    test("Create mongo user fail if role doesnt exist", async function () {
        userAdminData = (await import("../../data-obj/users/root-mongo-user")).default
        let userData = {...userAdminData,
            _id: '646a661e44c93567c23d8d56',
            email: "a456@asd567.com",
            username: "rolenotexist",
            role: "646a661e44c93567c23d8d89"
        }

        await assert.rejects(
            async () => {
                await userRepository.create(userData)
            },
            (err) => {
                //console.log("error",err)
                assert(err instanceof ValidationError, 'Expected error to be instance of ValidationError');
                assert.strictEqual(err.errors[0].field, 'role');
                assert.strictEqual(err.errors[0].reason, 'validation.notfound');
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
