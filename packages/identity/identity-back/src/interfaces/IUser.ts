import {IRole} from "./IRole";
import {IUserGroup} from "./IUserGroup";
import {IID} from "./IID";
import {ITenant} from "./ITenant";

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
    tenant?: ITenant | IID
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
    tenant?: IID
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
    tenant?: IID
    groups: IID[]
    password?: string
}

export {IUser, IUserCreate, IUserUpdate}
