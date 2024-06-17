import type {IRole} from "@/interfaces/IRole";

interface IUser {
    id?: string
    name?: string
    username: string
    password: string
    email: string
    active: boolean
    phone?: string
    avatar?: string
    avatarurl?: string
    role: IRole

}

export type {IUser}
