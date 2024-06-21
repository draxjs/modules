import UserMongoRepository from "../repository/mongo/UserMongoRepository.js";
import UserService from "../services/UserService.js";
import UserSqliteRepository from "../repository/sqlite/UserSqliteRepository.js";
import {DbEngine, DbSetupUtils} from "../utils/DbSetupUtils.js";
import {IUserRepository} from "../interfaces/IUserRepository";

let userService: UserService

const UserServiceFactory = () : UserService => {

    if(!userService){
        let userRepository: IUserRepository
        switch (DbSetupUtils.getDbEngine()) {
            case DbEngine.Mongo:
                console.log("UserServiceFactory DB ENGINE MONGODB")
                userRepository = new UserMongoRepository()
                break;
            case DbEngine.Sqlite:
                console.log("UserServiceFactory DB ENGINE SQLITE")
                userRepository = new UserSqliteRepository(DbSetupUtils.getDbConfig(),false)
                userRepository.table()
                break;
        }

        userService = new UserService(userRepository)
    }

    return userService
}

 export default UserServiceFactory
