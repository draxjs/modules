import {DraxConfig} from "../config/DraxConfig.js";
import IdentityConfig from "../config/CommonConfig.js";

function LoadCommonConfigFromEnv() {
    DraxConfig.set(IdentityConfig.BaseUrl, process.env[IdentityConfig.BaseUrl])
    DraxConfig.set(IdentityConfig.FileDir, process.env[IdentityConfig.FileDir])
    DraxConfig.set(IdentityConfig.MaxUploadSize, process.env[IdentityConfig.MaxUploadSize])

}

export default LoadCommonConfigFromEnv
export {
    LoadCommonConfigFromEnv
}
