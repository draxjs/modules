import type {IPasswordPolicy} from "@drax/identity-share";
import {DraxConfig} from "@drax/common-back";
import PasswordPolicyConfig from "../config/PasswordPolicyConfig.js";
import {PartialPasswordPolicySchema} from "../schemas/PasswordPolicySchema.js";

function getPasswordEnvPolicy(): Partial<IPasswordPolicy> {
    const envPolicy = {
        minLength: DraxConfig.getOrLoad(PasswordPolicyConfig.MinLength, "number"),
        maxLength: DraxConfig.getOrLoad(PasswordPolicyConfig.MaxLength, "number"),
        requireUppercase: DraxConfig.getOrLoad(PasswordPolicyConfig.RequireUppercase, "boolean"),
        requireLowercase: DraxConfig.getOrLoad(PasswordPolicyConfig.RequireLowercase, "boolean"),
        requireNumber: DraxConfig.getOrLoad(PasswordPolicyConfig.RequireNumber, "boolean"),
        requireSpecialChar: DraxConfig.getOrLoad(PasswordPolicyConfig.RequireSpecialChar, "boolean"),
        allowedSpecialChars: DraxConfig.getOrLoad(PasswordPolicyConfig.AllowedSpecialChars),
        disallowSpaces: DraxConfig.getOrLoad(PasswordPolicyConfig.DisallowSpaces, "boolean"),
        preventReuse: DraxConfig.getOrLoad(PasswordPolicyConfig.PreventReuse, "number"),
        expirationDays: DraxConfig.getOrLoad(PasswordPolicyConfig.ExpirationDays, "number")
    }

    return PartialPasswordPolicySchema.parse(
        Object.fromEntries(Object.entries(envPolicy).filter(([, value]) => value !== undefined))
    )
}

export default getPasswordEnvPolicy
export {getPasswordEnvPolicy}
