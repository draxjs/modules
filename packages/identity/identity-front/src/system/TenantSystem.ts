import type {ITenantProvider} from "../interfaces/ITenantProvider";
import type {ITenant, ITenantBase} from "@drax/identity-share";
import type {IDraxPaginateResult} from "@drax/common-share";


class TenantSystem {

    _provider: ITenantProvider
    prototype: string;

    constructor(provider: ITenantProvider) {
        this._provider = provider;
        this.prototype = 'TenantSystem'
    }

    fetchTenant():Promise<any> {
        return this._provider.fetchTenant()
    }

    async paginate({page= 1, limit= 5, orderBy="", orderDesc=false, search = ""}):Promise<IDraxPaginateResult<ITenant>> {
        return this._provider.paginate({page, limit, orderBy, orderDesc, search})
    }

    async create(userPayload: ITenantBase):Promise<ITenant> {
        return this._provider.create(userPayload)
    }

    async update(id:string, userPayload: ITenantBase):Promise<ITenant> {
        return this._provider.update(id, userPayload)
    }

    async delete(id: string):Promise<any> {
        return this._provider.delete(id)
    }

}

export default TenantSystem
export {TenantSystem}
