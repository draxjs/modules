import UserMongoRepository from "../repository/mongo/UserMongoRepository.js";
import UserService from "../services/UserService.js";
import UserSqliteRepository from "../repository/sqlite/UserSqliteRepository.js";
import process from "node:process";

const UserServiceFactory = () : UserService => {

    let userRepository
    if(process.env.SQLITE_DATABASE){
        userRepository = new UserSqliteRepository(process.env.SQLITE_DATABASE,false)
        userRepository.table()
    }else{
        userRepository = new UserMongoRepository()
    }

    const userService = new UserService(userRepository)
    return userService
}

 export default UserServiceFactory
