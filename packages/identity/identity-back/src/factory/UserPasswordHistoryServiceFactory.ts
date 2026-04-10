import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";
import type {IUserPasswordHistoryRepository} from "../interfaces/IUserPasswordHistoryRepository.js";
import UserPasswordHistoryMongoRepository from "../repository/mongo/UserPasswordHistoryMongoRepository.js";
import UserPasswordHistorySqliteRepository from "../repository/sqlite/UserPasswordHistorySqliteRepository.js";
import UserPasswordHistoryService from "../services/UserPasswordHistoryService.js";

let userPasswordHistoryService: UserPasswordHistoryService

const UserPasswordHistoryServiceFactory = (verbose: boolean = false): UserPasswordHistoryService => {
    if (!userPasswordHistoryService) {
        let repository: IUserPasswordHistoryRepository
        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                repository = new UserPasswordHistoryMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                const sqliteRepository = new UserPasswordHistorySqliteRepository(DraxConfig.getOrLoad(CommonConfig.SqliteDbFile), verbose)
                sqliteRepository.build()
                repository = sqliteRepository
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        userPasswordHistoryService = new UserPasswordHistoryService(repository)
    }

    return userPasswordHistoryService
}

export default UserPasswordHistoryServiceFactory
