import UserSessionMongoRepository from "../repository/mongo/UserSessionMongoRepository.js";
import UserSessionService from "../services/UserSessionService.js";
import UserSessionSqliteRepository from "../repository/sqlite/UserSessionSqliteRepository.js";
import {IUserSessionRepository} from "../interfaces/IUserSessionRepository";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

let userService: UserSessionService

const UserSessionServiceFactory = (verbose:boolean = false) : UserSessionService => {
    if(!userService){
        let userRepository: IUserSessionRepository
        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                userRepository = new UserSessionMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                userRepository = new UserSessionSqliteRepository(dbFile,verbose)
                userRepository.build()
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        userService = new UserSessionService(userRepository)
    }

    return userService
}

 export default UserSessionServiceFactory
