import UserRepository from "../repository/mongo/UserRepository.js";
import UserService from "../services/UserService.js";

const UserServiceFactory = () : UserService => {
    const userRepository = new UserRepository
    const userService = new UserService(userRepository)
    return userService
}

 export default UserServiceFactory
