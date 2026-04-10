import {afterAll, beforeAll, describe, expect, it} from "vitest";
import {LoadIdentityConfigFromEnv} from "../../src/setup/LoadIdentityConfigFromEnv.js";
import {TestSetup} from "../setup/TestSetup";

describe("Password Policy Route Test", () => {
    const testSetup = new TestSetup("sqlite")

    beforeAll(async () => {
        await testSetup.setup()
        process.env.PASSWORD_POLICY_REQUIRE_SPECIAL_CHAR = "true"
        process.env.PASSWORD_POLICY_MIN_LENGTH = "18"
        LoadIdentityConfigFromEnv()
    })

    afterAll(async () => {
        delete process.env.PASSWORD_POLICY_MIN_LENGTH
        delete process.env.PASSWORD_POLICY_REQUIRE_SPECIAL_CHAR
        await testSetup.dropAndClose()
    })

    it("returns the final effective policy", async () => {
        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: "/api/auth/password-policy"
        })

        expect(response.statusCode).toBe(200)
        const body = response.json()
        expect(body.minLength).toBe(18)
        expect(body.requireSpecialChar).toBe(true)
        expect(body.requireUppercase).toBe(true)
    })
})
