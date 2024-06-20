import {mongoose} from "@drax/common-back";
import {IRole} from "./IRole";
import {IUserGroup} from "./IUserGroup";
import {IID} from "./IID";

interface IUser {
    id?: IID
    username: string
    email: string
    password: string
    active: boolean | number
    name?: string
    phone?: string
    avatar?: string
    code?: string
    role: IRole | IID
    groups: IID[] | IUserGroup[] | string[] | string
    toObject(): IUser;
}

interface IUserCreate {
    id?: IID
    name: string
    username: string
    password: string
    email: string
    active: boolean | number
    phone: string
    role: IID
    groups: IID[] | string
}

interface IUserUpdate {
    id?: IID
    name: string
    username: string
    email: string
    active: boolean
    phone: string
    role: IID
    groups: IID[]
    password?: string
}

export {IUser, IUserCreate, IUserUpdate}
