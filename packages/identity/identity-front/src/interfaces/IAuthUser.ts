import type {IRole} from "@/interfaces/IRole";

interface IAuthUser {
    id: string
    username: string
    email: string
    active: boolean
    name: string
    phone: string
    avatar: string
    role: IRole

}

export type {IAuthUser}
