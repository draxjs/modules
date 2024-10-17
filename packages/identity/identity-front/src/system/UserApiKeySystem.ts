import type {IUserApiKeyProvider} from "../interfaces/IUserApiKeyProvider";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";


class UserApiKeySystem implements IUserApiKeyProvider{

    _provider: IUserApiKeyProvider
    prototype: string;

    constructor(provider: IUserApiKeyProvider) {
        this._provider = provider;
        this.prototype = 'UserSystem'
    }

    async search(value: any):Promise<IUserApiKey[]> {

        if(!this._provider.search){
            throw new Error("Search method not implemented")
        }

        return this._provider.search(value)
    }

    async paginate({page= 1, limit= 5, orderBy="", order=false, search = "", filters = []}: IDraxPaginateOptions):Promise<IDraxPaginateResult<IUserApiKey>> {
        return this._provider.paginate({page, limit, orderBy, order, search, filters})
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
