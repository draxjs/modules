
interface IUserLoginFailBase {
    user: any
    agent?: string
    ip?: string
    createdAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IUserLoginFail {
    _id: string
    user: any
    agent?: string
    ip?: string
    createdAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IUserLoginFailBase, 
IUserLoginFail
}
