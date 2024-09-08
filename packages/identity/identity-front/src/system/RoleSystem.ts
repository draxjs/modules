import type {IRoleProvider} from "../interfaces/IRoleProvider";
import type {IRole, IRoleBase} from "@drax/identity-share";
import type {IDraxPaginateResult} from "@drax/common-share";


class RoleSystem implements IRoleProvider {

    _provider: IRoleProvider
    prototype: string;

    constructor(provider: IRoleProvider) {
        this._provider = provider;
        this.prototype = 'RoleSystem'
    }

    fetchRole():Promise<any> {
        return this._provider.fetchRole()
    }

    fetchPermissions():Promise<any> {
        return this._provider.fetchPermissions()
    }

    async paginate({page= 1, limit= 5, orderBy="", order=false, search = ""}): Promise<IDraxPaginateResult<IRole>> {
        return this._provider.paginate({page, limit, orderBy, order, search})
    }

    async create(userPayload: IRoleBase):Promise<IRole> {
        return this._provider.create(userPayload)
    }

    async update(id:string, userPayload: IRoleBase):Promise<IRole> {
        return this._provider.update(id, userPayload)
    }

    async delete(id: string):Promise<any> {
        return this._provider.delete(id)
    }

}

export default RoleSystem
export {RoleSystem}
