import AuthUtils from "../utils/AuthUtils.js";
class UserService {
    constructor(userRepository) {
        this._repository = userRepository;
    }
    async auth(username, password) {
        let user = null;
        console.log("auth username", username);
        user = await this.findByUsername(username);
        if (user && user.active && AuthUtils.checkPassword(password, user.password)) {
            //TODO: Generar Sesion
            const session = '123';
            const accessToken = AuthUtils.generateToken(user.id.toString(), user.username, session);
            return { accessToken: accessToken };
        }
        else {
            throw Error('BadCredentials');
        }
    }
    async create(userData) {
        userData.name = userData?.name?.trim();
        userData.username = userData.username.trim();
        userData.password = AuthUtils.hashPassword(userData.password.trim());
        const user = await this._repository.create(userData);
        return user;
    }
    async update(id, userData) {
        userData.name = userData.name.trim();
        userData.username = userData.username.trim();
        delete userData.password;
        const user = await this._repository.update(id, userData);
        return user;
    }
    async delete(id) {
        const deletedRole = await this._repository.delete(id);
        return deletedRole;
    }
    async findById(id):Promise<IUser | null> {
        const user = await this._repository.findById(id);
        return user;
    }
    async findByUsername(username) {
        const user = await this._repository.findByUsername(username);
        return user;
    }
    async paginate(page = 1, limit = 10, filters) {
        const pagination = await this._repository.paginate(page, limit, filters);
        console.log("pagination", pagination);
        return pagination;
    }
}
export default UserService;
