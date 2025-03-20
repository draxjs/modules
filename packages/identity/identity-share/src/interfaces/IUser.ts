import {IRole} from "./IRole";
import {IUserGroup} from "./IUserGroup";
import {ITenant} from "./ITenant";

interface IUser{
    _id: string
    id?: string
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
    emailVerified?: boolean
    phoneVerified?: boolean
    emailCode?: string
    phoneCode?: string
    recoveryCode?: string
}

interface IUserEmailCreate {
    _id?: string
    id?: string
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
    _id?: string
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
    emailVerified?: boolean
    phoneVerified?: boolean
    emailCode?: string
    phoneCode?: string
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
    emailVerified?: boolean
    phoneVerified?: boolean
    emailCode?: string
    phoneCode?: string
}

export {IUser, IUserCreate, IUserUpdate, IUserEmailCreate}
