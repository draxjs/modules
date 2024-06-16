import type {IAuthUser} from "@/core/interfaces/IAuthUser";
import type {ILoginResponse} from "@/core/interfaces/ILoginResponse";

interface IAuthProvider {
    login(username: string, password: string): Promise<ILoginResponse>
    me(): Promise<IAuthUser>
}

export type {IAuthProvider}
