import {IPaginateFilter} from "@drax/common-back"
import {IUser} from "../interfaces/IUser";
import {IUserRepository} from "../interfaces/IUserRepository";
import AuthUtils from "../utils/AuthUtils.js";

class UserService {

    _repository: IUserRepository

    constructor(userRepository: IUserRepository) {
        this._repository = userRepository;
    }

    async create(userData: IUser): Promise<IUser> {

        userData.name = userData?.name?.trim()
        userData.username = userData.username.trim()
        userData.password = AuthUtils.hashPassword(userData.password.trim())

        const user: IUser = await this._repository.create(userData)
        return user
    }

    async update(id: any, userData: IUser) {

        userData.name = userData.name.trim()
        userData.username = userData.username.trim()
        delete userData.password

        const user: IUser = await this._repository.update(id, userData)
        return user
    }

    async delete(id: any): Promise<boolean> {
        const deletedRole: boolean = await this._repository.delete(id);
        return deletedRole;
    }

    async findById(id: any): Promise<IUser | null> {
        const user: IUser = await this._repository.findById(id);
        return user
    }

    async findByUsername(username: string): Promise<IUser | null> {
        const user: IUser = await this._repository.findByUsername(username);
        return user
    }

    async paginate( page : number = 1, limit : number = 10, filters ?: IPaginateFilter): Promise<{
        roles: IUser[],
        totalCount: number
    }> {

        const query = {}

        const options = {
            page: page,
            limit: limit
        }

        const pagination = await this._repository.paginate(query, options);
        console.log("pagination",pagination)
        return pagination;
    }
}

export default UserService
