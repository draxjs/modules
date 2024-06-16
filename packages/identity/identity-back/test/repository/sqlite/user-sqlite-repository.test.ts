import  {before, after, describe, it, test} from "node:test"
import assert, {equal} from "assert";
import UserSqliteRepository from "../../../src/repository/sqlite/UserSqliteRepository";
import RoleInitializer from "../../initializers/RoleInitializer";
import {IRole} from "../../../src/interfaces/IRole";
import {IUser} from "../../../src/interfaces/IUser";
import {ValidationError} from "@drax/common-back";
import {UUID} from "crypto";


test.describe("UserRepositoryTest", function () {

    const verbose = console.log
    let userRepository = new UserSqliteRepository("test.db", verbose)
    let adminRole: IRole
    let userAdminData: IUser

    before(async () => {
        //adminRole = await RoleInitializer.initAdminRole()
        return
    })

    after(async () => {
        await userRepository.deleteAll()
        return
    })

    test("Create sqlite user successfully", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userCreated = await userRepository.create(userAdminData)
       equal(userCreated.username, userAdminData.username)
    })

    test("Create sqlite user fail same id", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userData = {...userAdminData, email: "asd123@asd123.com", username: "asd123"}

        await assert.rejects(
            async () => {
                await userRepository.create(userData)
            },
            (err) => {
                assert(err instanceof ValidationError, 'Expected error to be instance of UniqueError');
                assert.strictEqual(err.errors[0].entity, 'User');
                assert.strictEqual(err.errors[0].field, 'id');
                assert.strictEqual(err.errors[0].reason, 'validation.unique');
                return true;
            },
        );
    })

    test("Create sqlite user fail same username", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userData = {...userAdminData, id: '539f51a6-5d40-4ef2-85c4-f480f042f422', email: "asd123@asd123.com" }

        await assert.rejects(
            async () => {
                await userRepository.create(userData)
            },
            (err) => {
                assert(err instanceof ValidationError, 'Expected error to be instance of UniqueError');
                assert.strictEqual(err.errors[0].entity, 'User');
                assert.strictEqual(err.errors[0].field, 'username');
                assert.strictEqual(err.errors[0].reason, 'validation.unique');
                return true;
            },
        );
    })

    test("Update a user successfully.",  async function() {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userAdminDataUpdated = {...userAdminData, phone: "66666666"}
        let userUpdated: IUser = await userRepository.update(userAdminDataUpdated.id as UUID, userAdminDataUpdated)
        equal(userUpdated.phone,userUpdated.phone)
    })

    test("Find user by ID successfully", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userFound = await userRepository.findById(userAdminData.id as UUID)
        equal(userFound.username, userAdminData.username)
    })

    test("Find user by username successfully", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userFound = await userRepository.findByUsername(userAdminData.username)
        equal(userFound.username, userAdminData.username)
        equal(userFound.id, userAdminData.id)
    })

    test("Paginate users successfully.",  async function() {
        let paginateUsers = await userRepository.paginate()
        equal(paginateUsers.items.length,1)
        equal(paginateUsers.total,1)
        equal(paginateUsers.page,1)
    })

})
