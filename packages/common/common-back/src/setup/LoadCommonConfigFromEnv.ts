import {DraxConfig} from "../config/DraxConfig.js";
import CommonConfig from "../config/CommonConfig.js";

function LoadCommonConfigFromEnv() {
    DraxConfig.set(CommonConfig.DbEngine, process.env[CommonConfig.DbEngine])
    DraxConfig.set(CommonConfig.SqliteDbFile, process.env[CommonConfig.SqliteDbFile])
    DraxConfig.set(CommonConfig.MongoDbUri, process.env[CommonConfig.MongoDbUri])
    DraxConfig.set(CommonConfig.BaseUrl, process.env[CommonConfig.BaseUrl])
    DraxConfig.set(CommonConfig.FileDir, process.env[CommonConfig.FileDir])
    DraxConfig.set(CommonConfig.MaxUploadSize, process.env[CommonConfig.MaxUploadSize])

}

export default LoadCommonConfigFromEnv
export {
    LoadCommonConfigFromEnv
}
