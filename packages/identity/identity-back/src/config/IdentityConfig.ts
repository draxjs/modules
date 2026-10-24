enum IdentityConfig {

    RegistrationTenantEnabled = "DRAX_REGISTRATION_TENANT_ENABLED",
    EmailVerificationTTLSeconds = "DRAX_EMAIL_VERIFICATION_TTL_SECONDS",
    EmailVerificationResendCooldownSeconds = "DRAX_EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS",

    RememberMeEnabled = "DRAX_REMEMBER_ME_ENABLED",
    RefreshTokenTTLSeconds = "DRAX_REFRESH_TOKEN_TTL_SECONDS",

    JwtSecret = "DRAX_JWT_SECRET",
    JwtExpiration = "DRAX_JWT_EXPIRATION",
    JwtIssuer = "DRAX_JWT_ISSUER",

    ApiKeySecret = "DRAX_APIKEY_SECRET",
    ApiKeyCacheTTL = "DRAX_APIKEY_CACHE_TTL",

    RbacCacheTTL = "DRAX_RBAC_CACHE_TTL",

    AvatarDir = "DRAX_AVATAR_DIR",

    defaultRole = "DRAX_DEFAULT_ROLE",

    VerifyIP = "DRAX_VERIFY_IP",

}

export default IdentityConfig;
export {IdentityConfig};
