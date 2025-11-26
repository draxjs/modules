import {IUser} from "./IUser";

interface IUserSession{
    _id: string
    uuid: string
    user: IUser
    userAgent?: string
    ip?: string
    createdAt?: string
    updatedAt?: string
}

interface IUserSessionBase{
    uuid: string
    user: IUser
    userAgent?: string
    ip?: string
}

export {IUserSession, IUserSessionBase}
