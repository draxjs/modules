import UserService from "./UserService.js";
import AuthUtils from "../utils/AuthUtils.js";
class AuthService {

    private _userService: UserService;

    constructor(userService : UserService) {
        this._userService = userService
    }



}

export default AuthService
