import {describe, it, beforeAll, afterAll, expect} from "vitest"

import {TestSetup} from "../setup/TestSetup"
import {IUserCreate} from "@drax/identity-share";




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

    let testSetup = new TestSetup()
    let FASTIFY_TEST_SERVER: any;
    let ROOT_USER: any;
    let ADMIN_ROLE: any;
    let ACCESS_TOKEN: any;

    beforeAll(async () => {
        await testSetup.setup()
        FASTIFY_TEST_SERVER = testSetup.fastifyInstance
        ROOT_USER = testSetup.rootUser
        ADMIN_ROLE = testSetup.adminRole
        const {accessToken} = await testSetup.login()
        ACCESS_TOKEN = accessToken
    })

    afterAll(async () => {
        await testSetup.mongoInMemory.DropAndClose()
        return
    })

    it("Login & Me (express)", async () => {
        let {accessToken} = await testSetup.login()
        expect(accessToken).toBeTruthy()
        let user = await testSetup.me(accessToken)
        expect(user.username).toBe(testSetup.rootUserData.username)
    })

    it("Login & Me (detailed)", async () => {

        const loginResp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: testSetup.rootUserData.username,
                password: testSetup.rootUserData.password
            }
        });

        expect(loginResp.statusCode).toBe(200)

        let loginBody = loginResp.json()

        expect(loginBody.accessToken).toBeTruthy()

        let accessToken = loginBody.accessToken

        const resp = await testSetup.fastifyInstance.inject({
            method: 'get',
            url: '/api/auth/me',
            headers: {Authorization: `Bearer ${accessToken}`}
        });
        let body = resp.json()

        expect(resp.statusCode).toBe(200)
        expect(body.name).toBe(testSetup.rootUserData.name)


    })


    it("should create a new user", async () => {

        const resp = await FASTIFY_TEST_SERVER.inject({
            method: 'POST',
            url: '/api/users',
            payload: {...USER1, ...{role: ADMIN_ROLE._id}},
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const result = await resp.json();
        expect(resp.statusCode).toBe(200);
        expect(result.name).toBe(USER1.name);
        expect(result._id).toBeDefined();


        // Verify tenant was created by fetching it
        const getResp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: '/api/users/search?search=' + result._id,
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
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
            await FASTIFY_TEST_SERVER.inject({
                method: 'POST',
                url: '/api/users',
                payload: {...data, ...{role: ADMIN_ROLE._id.toString()}},
                headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
            });
        }

        const resp = await FASTIFY_TEST_SERVER.inject({
            method: 'GET',
            url: '/api/users',
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        })

        const result = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(result.items.length).toBe(4)
        expect(result.items[0].name).toBe(ROOT_USER.name)
        expect(result.page).toBe(1)
        expect(result.limit).toBe(10)
        expect(result.total).toBe(4)

    })

    it("should change my password", async () => {


        const respPassword = await FASTIFY_TEST_SERVER.inject({
            method: 'POST',
            url: '/api/users/password/change',
            payload: {currentPassword: "root.123", newPassword: "newpass"},
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const resultPassword = await respPassword.json();
        expect(respPassword.statusCode).toBe(200);

        console.log("resultPassword", resultPassword)

    })

    it("should change password", async () => {


        const respPassword = await FASTIFY_TEST_SERVER.inject({
            method: 'POST',
            url: '/api/users/password/change/'+ROOT_USER._id,
            payload: {currentPassword: "root.123", newPassword: "newpass"},
            headers: {Authorization: `Bearer ${ACCESS_TOKEN}`}
        });

        const resultPassword = await respPassword.json();
        expect(respPassword.statusCode).toBe(200);

        console.log("resultPassword", resultPassword)

    })


})
