import {DraxConfig} from "@drax/common-back";
import IdentityConfig from "../config/IdentityConfig.js";
import PasswordPolicyConfig from "../config/PasswordPolicyConfig.js";
import {positiveVerificationSeconds} from '../config/EmailVerificationConfig.js';

function LoadIdentityConfigFromEnv() {

    DraxConfig.set(IdentityConfig.EmailVerificationTTLSeconds, positiveVerificationSeconds(
        process.env[IdentityConfig.EmailVerificationTTLSeconds], 86400, IdentityConfig.EmailVerificationTTLSeconds))
    DraxConfig.set(IdentityConfig.EmailVerificationResendCooldownSeconds, positiveVerificationSeconds(
        process.env[IdentityConfig.EmailVerificationResendCooldownSeconds], 60, IdentityConfig.EmailVerificationResendCooldownSeconds))
    DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, process.env[IdentityConfig.RegistrationTenantEnabled])
    DraxConfig.set(IdentityConfig.RememberMeEnabled, process.env[IdentityConfig.RememberMeEnabled])
    DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, process.env[IdentityConfig.RefreshTokenTTLSeconds])
    DraxConfig.set(IdentityConfig.JwtSecret, process.env[IdentityConfig.JwtSecret])
    DraxConfig.set(IdentityConfig.JwtExpiration, process.env[IdentityConfig.JwtExpiration])
    DraxConfig.set(IdentityConfig.JwtIssuer, process.env[IdentityConfig.JwtIssuer])
    DraxConfig.set(IdentityConfig.ApiKeySecret, process.env[IdentityConfig.ApiKeySecret])

    DraxConfig.set(IdentityConfig.RbacCacheTTL, process.env[IdentityConfig.RbacCacheTTL])
    DraxConfig.set(IdentityConfig.AvatarDir, process.env[IdentityConfig.AvatarDir])

    DraxConfig.set(PasswordPolicyConfig.MinLength, process.env[PasswordPolicyConfig.MinLength])
    DraxConfig.set(PasswordPolicyConfig.MaxLength, process.env[PasswordPolicyConfig.MaxLength])
    DraxConfig.set(PasswordPolicyConfig.RequireUppercase, process.env[PasswordPolicyConfig.RequireUppercase])
    DraxConfig.set(PasswordPolicyConfig.RequireLowercase, process.env[PasswordPolicyConfig.RequireLowercase])
    DraxConfig.set(PasswordPolicyConfig.RequireNumber, process.env[PasswordPolicyConfig.RequireNumber])
    DraxConfig.set(PasswordPolicyConfig.RequireSpecialChar, process.env[PasswordPolicyConfig.RequireSpecialChar])
    DraxConfig.set(PasswordPolicyConfig.AllowedSpecialChars, process.env[PasswordPolicyConfig.AllowedSpecialChars])
    DraxConfig.set(PasswordPolicyConfig.DisallowSpaces, process.env[PasswordPolicyConfig.DisallowSpaces])
    DraxConfig.set(PasswordPolicyConfig.PreventReuse, process.env[PasswordPolicyConfig.PreventReuse])
    DraxConfig.set(PasswordPolicyConfig.ExpirationDays, process.env[PasswordPolicyConfig.ExpirationDays])
}

export default LoadIdentityConfigFromEnv
export {
    LoadIdentityConfigFromEnv
}
