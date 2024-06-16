import UserRepository from "../repository/mongo/UserRepository.js";
import UserService from "../services/UserService.js";
import UserSqliteRepository from "../repository/sqlite/UserSqliteRepository.js";
const UserServiceFactory = () => {
    let userRepository;
    if (process.env.SQLITE_DATABASE) {
        userRepository = new UserSqliteRepository();
    }
    else {
        userRepository = new UserRepository();
    }
    const userService = new UserService(userRepository);
    return userService;
};
export default UserServiceFactory;
