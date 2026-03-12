
import {describe, it, beforeAll, afterAll, expect} from "vitest"
import {PersonFastifyRoutes} from '../people/routes/PersonRoutes'
import {PersonPermissions} from '../people/permissions/PersonPermissions'
import TestSetup from "../setup/TestSetup";

describe("Person Controller Test", function () {

    let testSetup = new TestSetup({
        routes: [PersonFastifyRoutes],
        permissions: [PersonPermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
        return
    })

    it("Me Tenant One", async () => {

        const {accessToken} = await testSetup.tenantOneUserLogin()
        expect(accessToken).toBeTruthy()

        const resp = await testSetup.fastifyInstance.inject({
            method: 'get',
            url: '/api/auth/me',
            headers: {Authorization: `Bearer ${accessToken}`}
        });
        let body = resp.json()
        console.log("me", body)
        expect(body.username).toBe(testSetup.tenantOneUserData.username)
    })

    it("Me Tenant Two", async () => {

        const {accessToken} = await testSetup.tenantTwoUserLogin()
        expect(accessToken).toBeTruthy()

        const resp = await testSetup.fastifyInstance.inject({
            method: 'get',
            url: '/api/auth/me',
            headers: {Authorization: `Bearer ${accessToken}`}
        });
        let body = resp.json()
        console.log("me", body)
        expect(body.username).toBe(testSetup.tenantTwoUserData.username)
    })

})
