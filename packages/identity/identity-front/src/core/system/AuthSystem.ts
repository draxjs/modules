import type {IAuthProviderInterface} from "@/core/interfaces/IAuthProviderInterface";

class AuthSystem{

    _provider : IAuthProviderInterface
    constructor(provider:IAuthProviderInterface) {
        this._provider = provider;
    }

    async login(username:string, password:string):Promise<string> {
        console.log("AuthSystem.login username",username)
        const r = await this._provider.login(username, password)
        console.log("AuthSystem.login",r)
        return r
    }
}

export default AuthSystem
export {AuthSystem}
