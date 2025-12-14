import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back"
import {SettingService} from "../services/SettingService.js";
import SettingMongoRepository from "../repository/mongo/SettingMongoRepository.js";
import SettingSqliteRepository from "../repository/sqlite/SettingSqliteRepository.js";
import type {ISettingRepository} from "../interfaces/ISettingRepository";

let settingService: SettingService

const SettingServiceFactory = (verbose: boolean = false): SettingService => {

    if (!settingService) {
        let settingRepository: ISettingRepository

        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                settingRepository = new SettingMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                settingRepository = new SettingSqliteRepository(dbFile, false)
                settingRepository.build()
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        settingService = new SettingService(settingRepository)
    }

    return settingService
}

export default SettingServiceFactory
