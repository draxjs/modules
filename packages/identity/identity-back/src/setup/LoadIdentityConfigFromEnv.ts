import {DraxConfig} from "@drax/common-back";
import IdentityConfig from "../config/IdentityConfig.js";

function LoadIdentityConfigFromEnv() {

    DraxConfig.set(IdentityConfig.JwtSecret, process.env[IdentityConfig.JwtSecret])
    DraxConfig.set(IdentityConfig.JwtExpiration, process.env[IdentityConfig.JwtExpiration])
    DraxConfig.set(IdentityConfig.JwtIssuer, process.env[IdentityConfig.JwtIssuer])
    DraxConfig.set(IdentityConfig.ApiKeySecret, process.env[IdentityConfig.ApiKeySecret])

    DraxConfig.set(IdentityConfig.RbacCacheTTL, process.env[IdentityConfig.RbacCacheTTL])
    DraxConfig.set(IdentityConfig.AvatarDir, process.env[IdentityConfig.AvatarDir])
}

export default LoadIdentityConfigFromEnv
export {
    LoadIdentityConfigFromEnv
}
