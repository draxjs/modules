import type {IRole} from "@/interfaces/IRole";

interface IUser {
    id: string
    name: string
    username: string
    email: string
    active: boolean
    phone: string
    avatar: string
    role: IRole

}

interface IUserCreate {
    name: string
    username: string
    password: string
    email: string
    active: boolean
    phone: string
    role: string
}

interface IUserUpdate {
    name: string
    username: string
    email: string
    active: boolean
    phone: string
    role: string
}

interface IUserPassword {
    newPassword: string
}

export type {IUser, IUserCreate, IUserUpdate, IUserPassword}
