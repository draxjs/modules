import {IRole} from "./IRole";
import {IUserGroup} from "./IUserGroup";
import {ITenant} from "./ITenant";

interface IUser{
    id: string
    username: string
    email: string
    password: string
    active: boolean
    name: string
    phone: string
    avatar: string
    role: IRole
    origin?: string
    createdAt?: string
    updatedAt?: string
    tenant?: ITenant
    groups?: IUserGroup[]
}

interface IUserEmailCreate {
    name: string
    username: string
    email: string
    active: boolean | number
    phone: string
    role: string
    origin?: string
    tenant?: string
    groups?: string[] | string
    createdAt?: string
}

interface IUserCreate {
    id?: string
    name: string
    username: string
    password: string
    email: string
    active: boolean | number
    phone: string
    role: string
    origin?: string
    tenant?: string
    groups?: string[] | string
    createdAt?: string
}

interface IUserUpdate {
    id?: string
    name: string
    username: string
    email: string
    active: boolean
    phone: string
    role: string
    tenant?: string
    groups?: string[] | string
    password?: string
    updatedAt?: string
}

export {IUser, IUserCreate, IUserUpdate, IUserEmailCreate}
