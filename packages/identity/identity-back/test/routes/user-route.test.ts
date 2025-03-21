import {describe, it, beforeAll, afterAll, expect} from "vitest"
import MongoInMemory from "../db/MongoInMemory";

process.env.DRAX_DB_ENGINE = "mongo"
process.env.DRAX_JWT_SECRET = "asdasdasd"

// import {InitializePermissions} from "./helpers/InitializePermissions.js"
// import {CreateRootUserAndAdminRole} from "./helpers/CreateRootUserAndAdminRole.js"
import {SetupIdentityDrax} from "./helpers/SetupIdentityDrax.js"
import {FastifyTestServerFactory} from './helpers/FastifyTestServerFactory.js'
import {IRoleBase, IUserCreate} from "@drax/identity-share";
import {UserRoutes, RoleServiceFactory, UserServiceFactory, PermissionService} from "../../src/index.js"


const USER1: IUserCreate = {
    active: true,
    password: "12345678",
    phone: "",
    role: "",
    name: "John Wick",
    username: "johnwick",
    email: "johnwick@example.com"
}
const USER2: IUserCreate = {
    active: true,
    password: "12345678",
    phone: "",
    role: "",
    name: "John Rambo",
    username: "rambo",
    email: "rambo@example.com"
}
const USER3: IUserCreate = {
    active: true,
    password: "12345678",
    phone: "",
    role: "",
    name: "John Depp",
    username: "depp",
    email: "depp@example.com"
}

describe("User Route Test", async function () {

    let FastifyTestServer;
    let adminUser, roleAdmin
    let accessToken;

    async function login() {
        const resp = await FastifyTestServer.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {username: 'root', password: "root.123"}
        });
        console.log("login", resp.statusCode)
        let body = resp.json()
        accessToken = body.accessToken;
    }

    beforeAll(async () => {
        await MongoInMemory.connect()
        // console.log("BEFORE MOCK", MongoInMemory.mongooseStatus, MongoInMemory.serverStatus)
        let {user, role} = await SetupIdentityDrax()
        adminUser = user
        roleAdmin = role
        FastifyTestServer = FastifyTestServerFactory()
        FastifyTestServer.register(UserRoutes)
        await login()
    })

    afterAll(async () => {
        await MongoInMemory.DropAndClose()
        // console.log("AFTER MOCK", MongoInMemory.status, MongoInMemory.serverStatus)
        return
    })

    it("Me", async () => {
        // console.log("user", adminUser)
        // console.log("role", roleAdmin)
        // console.log("accessToken", accessToken)

        const resp = await FastifyTestServer.inject({
            method: 'get',
            url: '/api/auth/me',
            headers: {Authorization: `Bearer ${accessToken}`}
        });
        let body = resp.json()
        console.log("me", body)
    })


    it("should create a new user", async () => {

        const resp = await FastifyTestServer.inject({
            method: 'POST',
            url: '/api/users',
            payload: {...USER1, ...{role: roleAdmin._id}},
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const result = await resp.json();
        expect(resp.statusCode).toBe(200);
        expect(result.name).toBe(USER1.name);
        expect(result._id).toBeDefined();


        // Verify tenant was created by fetching it
        const getResp = await FastifyTestServer.inject({
            method: 'GET',
            url: '/api/users/search?search=' + result._id,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const items = await getResp.json();
        expect(getResp.statusCode).toBe(200);
        expect(items[0].name).toBe(USER1.name);
    })


    it("Should paginate user", async () => {
        // First, create a few Users
        const users = [
            USER1, USER2, USER3
        ];

        for (const data of users) {
            await FastifyTestServer.inject({
                method: 'POST',
                url: '/api/users',
                payload: {...data, ...{role: roleAdmin._id.toString()}},
                headers: {Authorization: `Bearer ${accessToken}`}
            });
        }

        const resp = await FastifyTestServer.inject({
            method: 'GET',
            url: '/api/users',
            headers: {Authorization: `Bearer ${accessToken}`}
        })

        const result = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(result.items.length).toBe(4)
        expect(result.items[0].name).toBe(adminUser.name)
        expect(result.page).toBe(1)
        expect(result.limit).toBe(10)
        expect(result.total).toBe(4)

    })

    it("should change my password", async () => {


        const respPassword = await FastifyTestServer.inject({
            method: 'POST',
            url: '/api/users/password/change',
            payload: {currentPassword: "root.123", newPassword: "newpass"},
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const resultPassword = await respPassword.json();
        expect(respPassword.statusCode).toBe(200);

        console.log("resultPassword", resultPassword)

    })

    it("should change password", async () => {


        const respPassword = await FastifyTestServer.inject({
            method: 'POST',
            url: '/api/users/password/change/'+adminUser._id,
            payload: {currentPassword: "root.123", newPassword: "newpass"},
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const resultPassword = await respPassword.json();
        expect(respPassword.statusCode).toBe(200);

        console.log("resultPassword", resultPassword)

    })


})
