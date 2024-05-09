import AuthUtils from "../utils/AuthUtils.js";
class UserService {
    constructor(userRepository) {
        this._repository = userRepository;
    }
    async create(userData) {
        userData.name = userData?.name?.trim();
        userData.username = userData.username.trim();
        userData.password = AuthUtils.hashPassword(userData.password.trim());
        const user = await this._repository.create(userData);
        return user;
    }
    async update(_id, userData) {
        userData.name = userData.name.trim();
        userData.username = userData.username.trim();
        delete userData.password;
        const user = await this._repository.update(_id, userData);
        return user;
    }
    async delete(_id) {
        const deletedRole = await this._repository.delete(_id);
        return deletedRole;
    }
    async findById(_id) {
        const user = await this._repository.findById(_id);
        return user;
    }
    async findByUsername(username) {
        const user = await this._repository.findByUsername(username);
        return user;
    }
    async paginate(filters, page = 1, limit = 10) {
        const query = {};
        const options = {
            page: page,
            limit: limit
        };
        const pagination = await this._repository.paginate(query, options);
        console.log("pagination", pagination);
        return pagination;
    }
}
export default UserService;
