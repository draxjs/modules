import type {IRoleProvider} from "@/interfaces/IRoleProvider";


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

}

export default RoleSystem
export {RoleSystem}
