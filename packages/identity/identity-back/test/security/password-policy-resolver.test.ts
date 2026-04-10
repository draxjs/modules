import {afterEach, describe, expect, it} from "vitest";
import {DraxConfig} from "@drax/common-back";
import PasswordPolicyResolver from "../../src/resolver/PasswordPolicyResolver.js";
import PasswordPolicyConfig from "../../src/config/PasswordPolicyConfig.js";

describe("PasswordPolicyResolver", () => {
    afterEach(() => {
        delete process.env.PASSWORD_POLICY_MIN_LENGTH
        delete process.env.PASSWORD_POLICY_MAX_LENGTH
        delete process.env.PASSWORD_POLICY_REQUIRE_SPECIAL_CHAR
        DraxConfig.set(PasswordPolicyConfig.MinLength, undefined)
        DraxConfig.set(PasswordPolicyConfig.MaxLength, undefined)
        DraxConfig.set(PasswordPolicyConfig.RequireSpecialChar, undefined)
    })

    it("uses default policy when there are no overrides", async () => {
        const resolver = new PasswordPolicyResolver()
        const policy = await resolver.resolve()

        expect(policy.minLength).toBe(8)
        expect(policy.maxLength).toBe(64)
        expect(policy.requireUppercase).toBe(true)
    })

    it("project policy overrides default policy", async () => {
        const resolver = new PasswordPolicyResolver()
        resolver.setProjectPolicy({minLength: 12, requireUppercase: false, requireSpecialChar: true})
        const policy = await resolver.resolve()

        expect(policy.minLength).toBe(12)
        expect(policy.requireSpecialChar).toBe(true)
        expect(policy.requireUppercase).toBe(false)
    })

    it("env policy overrides project policy", async () => {
        process.env.PASSWORD_POLICY_MIN_LENGTH = "16"
        process.env.PASSWORD_POLICY_REQUIRE_SPECIAL_CHAR = "false"

        const resolver = new PasswordPolicyResolver()
        const policy = await resolver.resolve()

        expect(policy.minLength).toBe(16)
        expect(policy.requireSpecialChar).toBe(false)
    })

    it("ignores undefined env overrides", async () => {
        process.env.PASSWORD_POLICY_MIN_LENGTH = ""

        const resolver = new PasswordPolicyResolver()
        resolver.setProjectPolicy({minLength: 14})
        const policy = await resolver.resolve()

        expect(policy.minLength).toBe(14)
    })
})
