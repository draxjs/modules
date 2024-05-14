import UserService from "./UserService.js";
import AuthUtils from "../utils/AuthUtils.js";
class AuthService {

    private _userService: UserService;

    constructor(userService : UserService) {
        this._userService = userService
    }


    async auth(username : string, password : string){
        let user = null
        console.log("username",username)
        console.log("password",password)
        user = await this._userService.findByUsername(username)
        console.log("user",user)
        //Si obtuve usuario chequeo la password
        if (user && AuthUtils.checkPassword(password, user.password)) {
            //TODO: Generar Sesion
            const session = '123'
            const accessToken = AuthUtils.generateToken(user._id.toString(), user.username, session)
            return {accessToken: accessToken}
        }else{
            throw Error('BadCredentials')
        }
    }
}

export default AuthService
