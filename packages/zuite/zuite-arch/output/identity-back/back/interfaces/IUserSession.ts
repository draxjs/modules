
interface IUserSessionBase {
    uuid: string
    user: any
    agent?: string
    ip?: string
    createdAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IUserSession {
    _id: string
    uuid: string
    user: any
    agent?: string
    ip?: string
    createdAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IUserSessionBase, 
IUserSession
}
