import type {IAuthUser} from "@/interfaces/IAuthUser";
import type {ILoginResponse} from "@/interfaces/ILoginResponse";

interface IAuthProvider {
    login(username: string, password: string): Promise<ILoginResponse>
    me(): Promise<IAuthUser>
    logout(): void
    changeOwnPassword(currentPassword:string, newPassword:string):Promise<boolean>

}

export type {IAuthProvider}
