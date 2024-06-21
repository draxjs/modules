import {DraxConfig} from "@drax/common-back";
import IdentityConfig from "../config/IdentityConfig.js";

function LoadConfigFromEnv() {
    DraxConfig.set(IdentityConfig.DbEngine, process.env[IdentityConfig.DbEngine])
    DraxConfig.set(IdentityConfig.SqliteDbFile, process.env[IdentityConfig.SqliteDbFile])
    DraxConfig.set(IdentityConfig.MongoDbUri, process.env[IdentityConfig.MongoDbUri])
    DraxConfig.set(IdentityConfig.JwtSecret, process.env[IdentityConfig.JwtSecret])
    DraxConfig.set(IdentityConfig.JwtExpiration, process.env[IdentityConfig.JwtExpiration])
    DraxConfig.set(IdentityConfig.JwtIssuer, process.env[IdentityConfig.JwtIssuer])
}

export default LoadConfigFromEnv
export {
    LoadConfigFromEnv
}
