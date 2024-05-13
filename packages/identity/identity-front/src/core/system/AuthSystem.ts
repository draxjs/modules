import type {IAuthProviderInterface} from "../interfaces/IAuthProviderInterface.ts";

class AuthSystem {

    _provider : IAuthProviderInterface
    prototype: string;
    constructor(provider:IAuthProviderInterface) {
        this._provider = provider;
        this.prototype = 'AuthSystem'
    }

    async login(username:string, password:string):Promise<object> {
        console.log("AuthSystem.login username",username)
        const r = await this._provider.login(username, password)
        console.log("AuthSystem.login",r)
        return r
    }
}

export default AuthSystem
export {AuthSystem}
