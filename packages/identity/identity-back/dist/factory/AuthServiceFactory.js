import AuthService from "../services/AuthService.js";
import UserServiceFactory from "./UserServiceFactory.js";
const AuthServiceFactory = () => {
    const userService = UserServiceFactory();
    const authService = new AuthService(userService);
    return authService;
};
export default AuthServiceFactory;
