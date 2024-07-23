import {IUser} from "./IUser";

interface IUserApiKeyBase{
    id?: string
    name: string
    secret?: string
    ipv4?: string[] | string
    ipv6?: string[] | string
    createdAt?: string
}


interface IUserApiKey {
    id: string
    name: string
    secret: string
    user: IUser
    ipv4?: string[]
    ipv6?: string[]
    createdAt?: string
}

interface IUserApiKeySoftDelete extends IUserApiKey {
    softDelete():void
    softRestore():void
}

export {IUserApiKeyBase, IUserApiKey, IUserApiKeySoftDelete}