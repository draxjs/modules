import type {IRole} from "./IRole";
import type {ITenant} from "./ITenant";

interface IUser {
    id: string
    name: string
    username: string
    email: string
    active: boolean
    phone: string
    avatar: string
    role: IRole
    tenant: ITenant
}

interface IUserCreate {
    name: string
    username: string
    password: string
    email: string
    active: boolean
    phone: string
    role: string
    tenant: string
}

interface IUserUpdate {
    name: string
    username: string
    email: string
    active: boolean
    phone: string
    role: string
    tenant: string
}

interface IUserPassword {
    newPassword: string
    confirmPassword: string
}

export type {IUser, IUserCreate, IUserUpdate, IUserPassword}
