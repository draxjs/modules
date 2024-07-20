import {IUser} from "./IUser";

interface IUserApiKeyBase{
    id?: string
    name: string
    secret?: string
    createdAt?: string
}


interface IUserApiKey {
    id: string
    name: string
    secret: string
    user: IUser
    createdAt?: string
}

interface IUserApiKeySoftDelete extends IUserApiKey {
    softDelete():void
    softRestore():void
}

export {IUserApiKeyBase, IUserApiKey, IUserApiKeySoftDelete}
