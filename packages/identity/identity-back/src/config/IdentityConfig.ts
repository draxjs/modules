enum IdentityConfig {

    DbEngine = "DRAX_DB_ENGINE",
    SqliteDbFile = "DRAX_SQLITE_FILE",
    MongoDbUri = "DRAX_MONGO_URI",

    JwtSecret = "DRAX_JWT_SECRET",
    JwtExpiration = "DRAX_JWT_EXPIRATION",
    JwtIssuer = "DRAX_JWT_ISSUER",

    RbacCacheTTL = "DRAX_RBAC_CACHE_TTL",


}

export default IdentityConfig;
export {IdentityConfig};
