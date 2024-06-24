import type {IRoleProvider} from "../interfaces/IRoleProvider";
import type {IRole, IRoleBase} from "../interfaces/IRole";
import type {IPaginateClient} from "@drax/common-front";


class RoleSystem {

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

    async paginateRole(page:number = 1, perPage:number = 5, search:string=""):Promise<IPaginateClient<IRole>> {
        return this._provider.paginateRole(page, perPage,search)
    }

    async createRole(userPayload: IRoleBase):Promise<IRole> {
        return this._provider.createRole(userPayload)
    }

    async editRole(id:string, userPayload: IRoleBase):Promise<IRole> {
        return this._provider.editRole(id, userPayload)
    }

    async deleteRole(id: string):Promise<any> {
        return this._provider.deleteRole(id)
    }

}

export default RoleSystem
export {RoleSystem}
