import {describe, it, beforeAll, afterAll, expect} from "vitest"

import {TestSetup} from "../setup/TestSetup"
import {USER1} from "./data/users-data"


describe("User Route Test", async function () {

    let testSetup = new TestSetup()

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    it("RootLogin", async () => {
        let {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()
        let user = await testSetup.me(accessToken)
        expect(user.username).toBe(testSetup.rootUserData.username)
    })

    it("BasicUserLogin", async () => {
        let {accessToken} = await testSetup.basicUserLogin()
        expect(accessToken).toBeTruthy()
        let user = await testSetup.me(accessToken)
        expect(user.username).toBe(testSetup.basicUserData.username)
    })

    it("Login", async () => {

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

        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()

        const resp = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/users',
            payload: {...USER1, ...{role: testSetup.adminRole._id}},
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const result = await resp.json();
        expect(resp.statusCode).toBe(200);
        expect(result.name).toBe(USER1.name);
        expect(result._id).toBeDefined();


        // Verify user was created by fetching it
        const getResp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/users/search?search=' + result._id,
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const items = await getResp.json();
        expect(getResp.statusCode).toBe(200);
        expect(items[0].name).toBe(USER1.name);
    })


    it("Should paginate user", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()


        const resp = await testSetup.fastifyInstance.inject({
            method: 'GET',
            url: '/api/users',
            headers: {Authorization: `Bearer ${accessToken}`}
        })

        const result = await resp.json()
        expect(resp.statusCode).toBe(200)
        expect(result.items.length).toBe(3)
        expect(result.items[0].name).toBe(testSetup.rootUser.name)
        expect(result.page).toBe(1)
        expect(result.limit).toBe(10)
        expect(result.total).toBe(3)

    })

    it("should change my password", async () => {
        const {accessToken} = await testSetup.basicUserLogin()
        expect(accessToken).toBeTruthy()

        const respPassword = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/users/password/change',
            payload: {currentPassword: "basic.123", newPassword: "newpass"},
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const resultPassword = await respPassword.json();
        expect(respPassword.statusCode).toBe(200);

        console.log("resultPassword", resultPassword)

    })

    it("should change password", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        expect(accessToken).toBeTruthy()

        const respPassword = await testSetup.fastifyInstance.inject({
            method: 'POST',
            url: '/api/users/password/change/'+testSetup.rootUser._id,
            payload: {currentPassword: "root.123", newPassword: "newpass"},
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        const resultPassword = await respPassword.json();
        expect(respPassword.statusCode).toBe(200);

        console.log("resultPassword", resultPassword)

    })


})
