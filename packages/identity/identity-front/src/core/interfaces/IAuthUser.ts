import type {IAuthRole} from "@/core/interfaces/IAuthRole";

interface IAuthUser {
    _id: string
    username: string
    email: string
    active: boolean
    name?: string
    phone?: string
    avatar?: string
    avatarurl?: string
    code?: string
    role: IAuthRole

}

export type {IAuthUser}
