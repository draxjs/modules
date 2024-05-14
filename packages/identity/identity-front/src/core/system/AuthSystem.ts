import type {IAuthProvider} from "../interfaces/IAuthProvider.ts";
import type {IAuthUser} from "@/core/interfaces/IAuthUser";
import type {ILoginResponse} from "@/core/interfaces/ILoginResponse";

class AuthSystem {

    _provider : IAuthProvider
    prototype: string;
    constructor(provider:IAuthProvider) {
        this._provider = provider;
        this.prototype = 'AuthSystem'
    }

    async login(username:string, password:string):Promise<ILoginResponse> {
        const r = await this._provider.login(username, password)
        return r
    }

    async me():Promise<IAuthUser> {
        const authUser: IAuthUser = await this._provider.me()
        return authUser
    }
}

export default AuthSystem
export {AuthSystem}
