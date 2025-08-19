import type {IAuthProvider} from "../interfaces/IAuthProvider";
import type {IAuthUser} from "../interfaces/IAuthUser";
import type {ILoginResponse} from "../interfaces/ILoginResponse";
import type {IUserRegistration} from "../interfaces/IUserRegistration";

class AuthSystem implements IAuthProvider {

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

    async switchTenant(tenantId:string):Promise<ILoginResponse> {
        const r = await this._provider.switchTenant(tenantId)
        return r
    }

    logout():void {
        this._provider.logout()
    }

    async me():Promise<IAuthUser> {
        const authUser: IAuthUser = await this._provider.me()
        return authUser
    }

    async changeOwnPassword(currentPassword:string, newPassword:string):Promise<boolean> {
        const result: boolean = await this._provider.changeOwnPassword(currentPassword,newPassword)
        return result
    }

    async recoveryPasswordRequest(email:string):Promise<boolean> {
        const result: boolean = await this._provider.recoveryPasswordRequest(email)
        return result
    }

    async recoveryPasswordComplete(recoveryCode:string, newPassword:string):Promise<boolean> {
        const result: boolean = await this._provider.recoveryPasswordComplete(recoveryCode,newPassword)
        return result
    }

    async register(form: IUserRegistration):Promise<{success:boolean, message: string}> {
        const result = await this._provider.register(form)
        return result
    }

    async changeAvatar(file: File):Promise<boolean> {
        const result: boolean = await this._provider.changeAvatar(file)
        return result
    }
}

export default AuthSystem
export {AuthSystem}
