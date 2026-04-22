import z from "zod";
import type {IPasswordPolicy} from "@drax/identity-share";
import {allowedSpecialChars} from "../constants/PasswordSpecialChars.js";

class PasswordPolicySchemaFactory {
    private static cache = new Map<string, z.ZodType<string>>()

    static create(policy: IPasswordPolicy): z.ZodType<string> {
        const cacheKey = JSON.stringify(policy)
        const cached = this.cache.get(cacheKey)
        if (cached) {
            return cached
        }

        let schema = z.string({error: "validation.required"})
            .min(1, "validation.required")
            .min(policy.minLength, "validation.password.minLength")
            .max(policy.maxLength, "validation.password.maxLength")

        if (policy.requireUppercase) {
            schema = schema.regex(/[A-Z]/, "validation.password.requireUppercase")
        }

        if (policy.requireLowercase) {
            schema = schema.regex(/[a-z]/, "validation.password.requireLowercase")
        }

        if (policy.requireNumber) {
            schema = schema.regex(/[0-9]/, "validation.password.requireNumber")
        }

        if (policy.requireSpecialChar) {
            schema = schema.refine(
                (value) => [...value].some((char) => allowedSpecialChars.includes(char)),
                "validation.password.requireSpecialChar"
            )
        }

        if (policy.disallowSpaces) {
            schema = schema.refine((value) => !/\s/.test(value), {
                message: "validation.password.disallowSpaces"
            })
        }

        this.cache.set(cacheKey, schema)
        return schema
    }
}

export default PasswordPolicySchemaFactory
export {PasswordPolicySchemaFactory}
