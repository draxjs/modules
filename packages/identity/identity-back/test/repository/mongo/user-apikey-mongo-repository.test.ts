import {before, after, describe, it, test} from "node:test"
import assert, {equal} from "assert";
import UserApiKeyMongoRepository from "../../../src/repository/mongo/UserApiKeyMongoRepository";
import MongoInMemory from "../../db/MongoInMemory";
import RoleMongoInitializer from "../../initializers/RoleMongoInitializer";
import UserMongoInitializer from "../../initializers/UserMongoInitializer";
import {IUserApiKey} from "../../../../identity-share/src/interfaces/IUserApiKey";
import type {IDraxPaginateResult} from "@drax/crud-share";
import {mongoose, ValidationError} from "@drax/common-back";


test.describe("UserApiKeyRepositoryTest", function () {

    let userApiKeyRepository = new UserApiKeyMongoRepository()
    let data
    let adminRole
    let rootUser

    before(async () => {
        await MongoInMemory.connect()
        adminRole = await RoleMongoInitializer.initAdminRole()
        rootUser = await UserMongoInitializer.initRootUser()

        //console.log("BEFORE USER", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    after(async () => {
        await MongoInMemory.DropAndClose()
        //console.log("AFTER USER", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    test("Create mongo user apikey successfully", async function () {
        data = (await import("../../data-obj/apikey/root-mongo-user-apikey")).default
        let userApiKeyCreated = await userApiKeyRepository.create(data)
        equal(userApiKeyCreated.name, data.name)
    })

    test("Find mongo user by ID successfully", async function () {
        data = (await import("../../data-obj/apikey/root-mongo-user-apikey")).default
        let userApiKeyFound = await userApiKeyRepository.findById(data._id)

        equal(userApiKeyFound.name, data.name)
    })

    test("Find mongo user by secret successfully", async function () {
        data = (await import("../../data-obj/apikey/root-mongo-user-apikey")).default
        console.log("Data:",data)
        let userApiKeyFound = await userApiKeyRepository.findBySecret(data.secret)
        console.log("userApiKeyFound",userApiKeyFound)
        equal(userApiKeyFound.secret, data.secret)
    })


    test("Update mongo user apikey successfully.", async function () {
        data = (await import("../../data-obj/apikey/root-mongo-user-apikey")).default
        data.name = "AdminUpdated"
        let userUpdated: IUserApiKey = await userApiKeyRepository.update(data._id, data)
        equal(userUpdated.name, userUpdated.name)
    })


    test("Paginate mongo users successfully.", async function () {
        let paginateUsersApiKey: IDraxPaginateResult<IUserApiKey> = await userApiKeyRepository.paginate({
            page: 1,
            limit: 5
        })
        equal(paginateUsersApiKey.items.length, 1)
        equal(paginateUsersApiKey.total, 1)
        equal(paginateUsersApiKey.page, 1)
    })
})
