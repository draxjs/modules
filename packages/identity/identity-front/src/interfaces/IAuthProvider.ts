import type {IAuthUser} from "./IAuthUser";
import type {ILoginResponse} from "./ILoginResponse";
import type {IUserRegistration} from "./IUserRegistration";

interface IAuthProvider {
    login(username: string, password: string): Promise<ILoginResponse>
    me(): Promise<IAuthUser>
    switchTenant(tenantId: string): Promise<ILoginResponse>
    logout(): void
    changeOwnPassword(currentPassword:string, newPassword:string):Promise<boolean>
    recoveryPasswordRequest(email:string):Promise<boolean>
    recoveryPasswordComplete(recoveryCode:string, newPassword:string):Promise<boolean>
    register(form:IUserRegistration):Promise<{success:boolean, message: string}>
    changeAvatar(file: File): Promise<boolean>
}

export type {IAuthProvider}
