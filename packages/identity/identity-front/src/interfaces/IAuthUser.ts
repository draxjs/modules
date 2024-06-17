import type {IRole} from "@/interfaces/IRole";

interface IAuthUser {
    id: string
    username: string
    email: string
    active: boolean
    name?: string
    phone?: string
    avatar?: string
    avatarurl?: string
    code?: string
    role: IRole

}

export type {IAuthUser}
