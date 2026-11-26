enum IdentityConfig {

    LdapEnabled = "DRAX_LDAP_ENABLED",
    LdapUrl = "DRAX_LDAP_URL",
    LdapUsersDn = "DRAX_LDAP_USERS_DN",
    LdapGroupsDn = "DRAX_LDAP_GROUPS_DN",
    LdapStartTLS = "DRAX_LDAP_STARTTLS",
    LdapDefaultRole = "DRAX_LDAP_DEFAULT_ROLE",

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
