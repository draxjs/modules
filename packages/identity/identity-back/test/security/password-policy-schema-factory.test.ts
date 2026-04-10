import {describe, expect, it} from "vitest";
import PasswordPolicySchemaFactory from "../../src/utils/PasswordPolicySchemaFactory.js";
import {defaultPasswordPolicy} from "../../src/policies/defaultPasswordPolicy.js";

describe("PasswordPolicySchemaFactory", () => {
    it("validates minLength", async () => {
        const schema = PasswordPolicySchemaFactory.create(defaultPasswordPolicy)
        await expect(schema.parseAsync("Abc1234")).rejects.toThrow()
    })

    it("validates maxLength", async () => {
        const schema = PasswordPolicySchemaFactory.create({...defaultPasswordPolicy, maxLength: 8})
        await expect(schema.parseAsync("Abcd12345")).rejects.toThrow()
    })

    it("validates uppercase", async () => {
        const schema = PasswordPolicySchemaFactory.create(defaultPasswordPolicy)
        await expect(schema.parseAsync("lowercase1")).rejects.toThrow()
    })

    it("validates lowercase", async () => {
        const schema = PasswordPolicySchemaFactory.create(defaultPasswordPolicy)
        await expect(schema.parseAsync("UPPERCASE1")).rejects.toThrow()
    })

    it("validates number", async () => {
        const schema = PasswordPolicySchemaFactory.create(defaultPasswordPolicy)
        await expect(schema.parseAsync("NoNumbers")).rejects.toThrow()
    })

    it("validates specialChar", async () => {
        const schema = PasswordPolicySchemaFactory.create({...defaultPasswordPolicy, requireSpecialChar: true})
        await expect(schema.parseAsync("NoSpecial1")).rejects.toThrow()
    })

    it("validates disallowSpaces", async () => {
        const schema = PasswordPolicySchemaFactory.create(defaultPasswordPolicy)
        await expect(schema.parseAsync("Space 123A")).rejects.toThrow()
    })
})
