import type {IAuthFullUser} from "./IAuthFullUser";
import type {ILoginResponse} from "./ILoginResponse";
import type {IPasswordPolicy} from "./IPasswordPolicy";
import type {IUserRegistration} from "./IUserRegistration";

interface IAuthProvider {
    login(username: string, password: string, rememberMe?: boolean): Promise<ILoginResponse>
    refresh?(refreshToken: string): Promise<ILoginResponse>
    revokeSession?(refreshToken: string): Promise<void>
    me(): Promise<IAuthFullUser>
    switchTenant(tenantId: string): Promise<ILoginResponse>
    logout(): void
    passwordPolicy(): Promise<IPasswordPolicy>
    changeOwnPassword(currentPassword:string, newPassword:string):Promise<boolean>
    recoveryPasswordRequest(email:string):Promise<boolean>
    recoveryPasswordComplete(recoveryCode:string, newPassword:string):Promise<boolean>
    register(form:IUserRegistration):Promise<{success:boolean, message: string}>
    changeAvatar(file: File): Promise<boolean>
}

export type {IAuthProvider}
