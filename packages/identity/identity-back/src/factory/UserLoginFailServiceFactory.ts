import UserLoginFailMongoRepository from "../repository/mongo/UserLoginFailMongoRepository.js";
import UserLoginFailService from "../services/UserLoginFailService.js";
import UserLoginFailSqliteRepository from "../repository/sqlite/UserLoginFailSqliteRepository.js";
import {IUserLoginFailRepository} from "../interfaces/IUserLoginFailRepository";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

let userService: UserLoginFailService

const UserLoginFailServiceFactory = (verbose:boolean = false) : UserLoginFailService => {
    if(!userService){
        let userRepository: IUserLoginFailRepository
        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                userRepository = new UserLoginFailMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                userRepository = new UserLoginFailSqliteRepository(dbFile,verbose)
                userRepository.build()
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        userService = new UserLoginFailService(userRepository)
    }

    return userService
}

 export default UserLoginFailServiceFactory
