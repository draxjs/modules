enum IdentityConfig {



    JwtSecret = "DRAX_JWT_SECRET",
    JwtExpiration = "DRAX_JWT_EXPIRATION",
    JwtIssuer = "DRAX_JWT_ISSUER",

    ApiKeySecret = "DRAX_APIKEY_SECRET",
    ApiKeyCacheTTL = "DRAX_APIKEY_CACHE_TTL",

    RbacCacheTTL = "DRAX_RBAC_CACHE_TTL",

    AvatarDir = "DRAX_AVATAR_DIR",

    defaultRole = "DRAX_DEFAULT_ROLE",


}

export default IdentityConfig;
export {IdentityConfig};
