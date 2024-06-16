import type {IUserProvider} from "@/core/interfaces/IUserProvider";


class UserSystem {

    _provider: IUserProvider
    prototype: string;

    constructor(provider: IUserProvider) {
        this._provider = provider;
        this.prototype = 'UserSystem'
    }

    paginateUser(page:number = 1, perPage:number = 5):Promise<any> {
        return this._provider.paginateUser(page, perPage)
    }

}

export default UserSystem
export {UserSystem}
