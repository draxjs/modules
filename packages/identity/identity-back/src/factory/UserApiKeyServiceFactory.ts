import UserApiKeyMongoRepository from "../repository/mongo/UserApiKeyMongoRepository.js";
import UserApiKeyService from "../services/UserApiKeyService.js";
import UserApiKeySqliteRepository from "../repository/sqlite/UserApiKeySqliteRepository.js";
import {IUserApiKeyRepository} from "../interfaces/IUserApiKeyRepository";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

let userService: UserApiKeyService

const UserApiKeyServiceFactory = (verbose: boolean = false): UserApiKeyService => {
    if (!userService) {
        let userRepository: IUserApiKeyRepository
        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                userRepository = new UserApiKeyMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                userRepository = new UserApiKeySqliteRepository(dbFile, verbose)
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        userService = new UserApiKeyService(userRepository)
    }

    return userService
}

export default UserApiKeyServiceFactory
