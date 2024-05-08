import  {before, after, describe, it} from "node:test"
import {equal} from "assert";
import UserRepository from "../../src/repository/UserRepository";
import MongoInMemory from "../initializers/MongoInMemory";
import RoleInitializer from "../initializers/RoleInitializer";
import {IRole} from "../../src/interfaces/IRole";
import {IUser} from "../../src/interfaces/IUser";
import {PaginateResult} from "mongoose";

describe("UserRepositoryTest", function () {

    let userRepository = new UserRepository()
    let adminRole: IRole
    let userAdminData: IUser

    before(async () => {
        await MongoInMemory.connect()
        adminRole = await RoleInitializer.initAdminRole()
        userAdminData = (await import("../data-obj/users/root-user")).default
        //console.log("BEFORE USER", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        return
    })

    after(async () => {
        await MongoInMemory.DropAndClose()
        //console.log("AFTER USER", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    it("Create user successfully", async function () {
        let userCreated = await userRepository.create(userAdminData)
       equal(userCreated.username, userAdminData.username)
    })

    it("Update a user successfully.",  async function() {
        let adminData = (await import("../data-obj/users/root-user")).default
        adminData.name = "AdminUpdated"
        let userUpdated: IUser = await userRepository.update(adminData._id, adminData)
        equal(userUpdated.name,userUpdated.name)
    })

    it("Find user by ID successfully", async function () {
        let userCreated = await userRepository.findById(userAdminData._id)
        equal(userCreated.username, userAdminData.username)
    })

    it("Paginate users successfully.",  async function() {
        let paginateUsers: PaginateResult<IUser> = await userRepository.paginate()
        //console.log(paginateUsers)
        equal(paginateUsers.docs.length,1)
        equal(paginateUsers.totalDocs,1)
        equal(paginateUsers.page,1)
    })
})
