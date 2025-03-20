import {IUser} from "./IUser";

interface IUserApiKeyBase{
    _id?: string
    id?: string
    name: string
    secret?: string
    ipv4?: string[] | string
    ipv6?: string[] | string
    createdBy?: string
    createdAt?: string
}

interface IUserApiKey {
    _id: string
    id?: string
    name: string
    secret: string
    user: IUser
    ipv4?: string[]
    ipv6?: string[]
    createdBy: IUser
    createdAt?: string
    deleted?: boolean
}

interface IUserApiKeySoftDelete extends IUserApiKey {
    softDelete():void
    softRestore():void
}

export {IUserApiKeyBase, IUserApiKey, IUserApiKeySoftDelete}
