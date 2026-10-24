import type {IAuthFullUser} from "./IAuthFullUser";
import type {ILoginResponse} from "./ILoginResponse";
import type {IPasswordPolicy} from "./IPasswordPolicy";
import type {IUserRegistration} from "./IUserRegistration";
import type {IRegistrationResponse} from "./IRegistrationResponse";
import type {IVerificationResendResponse} from "./IVerificationResendResponse";

import type {IRegistrationOptions} from "./IRegistrationOptions";

interface IAuthProvider {
    login(username: string, password: string, rememberMe?: boolean): Promise<ILoginResponse>
    refresh?(refreshToken: string): Promise<ILoginResponse>
    revokeSession?(refreshToken: string): Promise<void>
    me(): Promise<IAuthFullUser>
    switchTenant(tenantId: string): Promise<ILoginResponse>
    logout(): void
    passwordPolicy(): Promise<IPasswordPolicy>
    registrationOptions(): Promise<IRegistrationOptions>
    changeOwnPassword(currentPassword:string, newPassword:string):Promise<boolean>
    recoveryPasswordRequest(email:string):Promise<boolean>
    recoveryPasswordComplete(recoveryCode:string, newPassword:string):Promise<boolean>
    register(form:IUserRegistration):Promise<IRegistrationResponse>
    resendVerificationEmail?(email:string):Promise<IVerificationResendResponse>
    changeAvatar(file: File): Promise<boolean>
}

export type {IAuthProvider}
