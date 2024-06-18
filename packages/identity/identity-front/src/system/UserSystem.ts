import type {IUserProvider} from "@/interfaces/IUserProvider";
import type {IUser, IUserCreate, IUserUpdate} from "@/interfaces/IUser";
import type {IPaginateClient} from "@drax/common-front";


class UserSystem {

    _provider: IUserProvider
    prototype: string;

    constructor(provider: IUserProvider) {
        this._provider = provider;
        this.prototype = 'UserSystem'
    }

    async paginateUser(page:number = 1, perPage:number = 5):Promise<IPaginateClient> {
        return this._provider.paginateUser(page, perPage)
    }

    async createUser(userPayload: IUserCreate):Promise<IUser> {
        return this._provider.createUser(userPayload)
    }

    async editUser(id:string, userPayload: IUserUpdate):Promise<IUser> {
        return this._provider.editUser(id, userPayload)
    }

    async deleteUser(id: string):Promise<any> {
        return this._provider.deleteUser(id)
    }

}

export default UserSystem
export {UserSystem}
