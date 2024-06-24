import type {ITenantProvider} from "../interfaces/ITenantProvider";
import type {ITenant, ITenantBase} from "../interfaces/ITenant";
import type {IPaginateClient} from "@drax/common-front";


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

    async paginateTenant(page:number = 1, perPage:number = 5, search:string=""):Promise<IPaginateClient<ITenant>> {
        return this._provider.paginateTenant(page, perPage,search)
    }

    async createTenant(userPayload: ITenantBase):Promise<ITenant> {
        return this._provider.createTenant(userPayload)
    }

    async editTenant(id:string, userPayload: ITenantBase):Promise<ITenant> {
        return this._provider.editTenant(id, userPayload)
    }

    async deleteTenant(id: string):Promise<any> {
        return this._provider.deleteTenant(id)
    }

}

export default TenantSystem
export {TenantSystem}
