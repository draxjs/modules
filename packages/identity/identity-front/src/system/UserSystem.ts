import type {IUserProvider} from "@/interfaces/IUserProvider";
import type {IUser} from "@/interfaces/IUser";


class UserSystem {

    _provider: IUserProvider
    prototype: string;

    constructor(provider: IUserProvider) {
        this._provider = provider;
        this.prototype = 'UserSystem'
    }

    async paginateUser(page:number = 1, perPage:number = 5):Promise<any> {
        return this._provider.paginateUser(page, perPage)
    }

    async create(userPayload: IUser):Promise<any> {
        return this._provider.createUser(userPayload)
    }

}

export default UserSystem
export {UserSystem}
