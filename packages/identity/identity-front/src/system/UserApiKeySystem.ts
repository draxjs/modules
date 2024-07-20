import type {IUserApiKeyProvider} from "../interfaces/IUserApiKeyProvider";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxPaginateResult} from "@drax/common-share";


class UserApiKeySystem {

    _provider: IUserApiKeyProvider
    prototype: string;

    constructor(provider: IUserApiKeyProvider) {
        this._provider = provider;
        this.prototype = 'UserSystem'
    }

    async paginate({page= 1, limit= 5, orderBy="", orderDesc=false, search = ""}):Promise<IDraxPaginateResult<IUserApiKey>> {
        return this._provider.paginate({page, limit, orderBy, orderDesc, search})
    }

    async create(userPayload: IUserApiKeyBase):Promise<IUserApiKey> {
        return this._provider.create(userPayload)
    }

    async update(id:string, userPayload: IUserApiKeyBase):Promise<IUserApiKey> {
        return this._provider.update(id, userPayload)
    }

    async delete(id: string):Promise<any> {
        return this._provider.delete(id)
    }

}

export default UserApiKeySystem
export {UserApiKeySystem}
