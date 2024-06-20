import type {IRoleProvider} from "@/interfaces/IRoleProvider";
import type {IRole} from "@/interfaces/IRole";
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

    async paginateRole(page:number = 1, perPage:number = 5):Promise<IPaginateClient> {
        return this._provider.paginateRole(page, perPage)
    }

    async createRole(userPayload: IRole):Promise<IRole> {
        return this._provider.createRole(userPayload)
    }

    async editRole(id:string, userPayload: IRole):Promise<IRole> {
        return this._provider.editRole(id, userPayload)
    }

    async deleteRole(id: string):Promise<any> {
        return this._provider.deleteRole(id)
    }

}

export default RoleSystem
export {RoleSystem}
