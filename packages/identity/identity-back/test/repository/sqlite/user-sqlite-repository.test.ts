import  {beforeAll, afterAll, describe, it, test} from "vitest"
import assert, {equal} from "assert";
import UserSqliteRepository from "../../../src/repository/sqlite/UserSqliteRepository";
import {IUser} from "../../../../identity-share/src/interfaces/IUser";
import {IRole} from "../../../../identity-share/src/interfaces/IRole";

import {ValidationError} from "@drax/common-back";
import {UUID} from "crypto";
import RoleSqliteInitializer from "../../initializers/RoleSqliteInitializer";

describe("UserRepositoryTest", function () {

    let userRepository = new UserSqliteRepository("test.db", false)
    let userAdminData: any
    let adminRole: IRole

    beforeAll(async () => {
        userRepository.build()
        adminRole = (await import("../../data-obj/roles/admin-sqlite-role")).default
        adminRole = await RoleSqliteInitializer()
        return
    })

    afterAll(async () => {
        // await userRepository.deleteAll()
        return
    })

    it("Delete All.",  async function() {
        let r = await userRepository.deleteAll()
        equal(r,true)
    })


    test("Create sqlite user successfully", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userCreated:IUser = await userRepository.create(userAdminData)
       equal(userCreated.username, userAdminData.username)
    })

    test("Find user by ID successfully", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userFound = await userRepository.findById(userAdminData._id as UUID)
        equal(userFound.username, userAdminData.username)
        //ROLE POPULATED
        let rolefound = userFound.role as IRole
        equal(rolefound.name, adminRole.name)
    })

    test("Create sqlite user fail same id", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userData = {...userAdminData, email: "asd123@asd123.com", username: "asd123"}

        await assert.rejects(
            async () => {
                await userRepository.create(userData)
            },
            (err) => {
                assert(err instanceof ValidationError, 'Expected error to be instance of ValidationError');
                assert.strictEqual(err.errors[0].field, 'id');
                assert.strictEqual(err.errors[0].reason, 'validation.unique');
                return true;
            },
        );
    })

    test("Create sqlite user fail same username", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userData = {...userAdminData, _id: '539f51a6-5d40-4ef2-85c4-f480f042f422', email: "asd123@asd123.com" }

        await assert.rejects(
            async () => {
                await userRepository.create(userData)
            },
            (err) => {
                assert(err instanceof ValidationError, 'Expected error to be instance of ValidationError');
                assert.strictEqual(err.errors[0].field, 'username');
                assert.strictEqual(err.errors[0].reason, 'validation.unique');
                return true;
            },
        );
    })

    test("Create sqlite user fail if role doesnt exist", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userData = {...userAdminData,
            _id: '539f51a6-5d40-4ef2-85c4-f480f042f422',
            email: "a456@asd567.com",
            username: "rolenotexist",
            role: "notexist"
        }

        await assert.rejects(
            async () => {
                await userRepository.create(userData)
            },
            (err) => {
                assert(err instanceof ValidationError, 'Expected error to be instance of ValidationError');
                assert.strictEqual(err.errors[0].field, 'role');
                assert.strictEqual(err.errors[0].reason, 'validation.notfound');
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



    test("Find user by username successfully", async function () {
        userAdminData = (await import("../../data-obj/users/root-sqlite-user")).default
        let userFound = await userRepository.findByUsername(userAdminData.username)
        equal(userFound.username, userAdminData.username)
        equal(userFound.id, userAdminData.id)
    })

    test("Paginate users successfully.",  async function() {
        let paginateUsers = await userRepository.paginate({page: 1, limit:5})

        equal(paginateUsers.total,1)
        equal(paginateUsers.page,1)
        equal(paginateUsers.limit,5)
        equal(paginateUsers.items.length,1)
        equal(paginateUsers.items[0].role.name,adminRole.name)
    })

})
