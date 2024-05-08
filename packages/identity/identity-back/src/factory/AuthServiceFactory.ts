import AuthService from "../services/AuthService.js";
import UserServiceFactory from "./UserServiceFactory.js";

const AuthServiceFactory = () : AuthService => {
    const userService = UserServiceFactory()
    const authService = new AuthService(userService)
    return authService
}

 export default AuthServiceFactory
