import AuthUtils from "../utils/AuthUtils.js";
class AuthService {
    constructor(userService) {
        this._userService = userService;
    }
    async auth(username, password) {
        let user = null;
        user = await this._userService.findByUsername(username);
        //Si obtuve usuario chequeo la password
        if (user && AuthUtils.checkPassword(password, user.password)) {
            //TODO: Generar Sesion
            const session = '123';
            const token = AuthUtils.generateToken(user._id.toString(), user.username, session);
            return token;
        }
        else {
            throw Error('BadCredentials');
        }
    }
}
export default AuthService;
