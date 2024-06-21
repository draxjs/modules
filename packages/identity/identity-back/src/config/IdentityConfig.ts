enum IdentityConfig {

    DbEngine = "DB_ENGINE",
    SqliteDbFile = "SQLITE_FILE",
    MongoDbUri = "MONGO_URI",

    JwtSecret = "JWT_SECRET",
    JwtExpiration = "JWT_EXPIRATION",
    JwtIssuer = "JWT_ISSUER",

    RbacCacheTTL = "RBAC_CACHE_TTL",


}

export default IdentityConfig;
export {IdentityConfig};
