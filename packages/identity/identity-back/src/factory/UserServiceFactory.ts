import UserMongoRepository from "../repository/mongo/UserMongoRepository.js";
import UserService from "../services/UserService.js";
import UserSqliteRepository from "../repository/sqlite/UserSqliteRepository.js";
import {IUserRepository} from "../interfaces/IUserRepository";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

let userService: UserService

const UserServiceFactory = (verbose:boolean = false) : UserService => {
    if(!userService){
        let userRepository: IUserRepository
        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                userRepository = new UserMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                userRepository = new UserSqliteRepository(dbFile,verbose)
                userRepository.build()
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        userService = new UserService(userRepository)
    }

    return userService
}

 export default UserServiceFactory
