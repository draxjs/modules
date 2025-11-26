
interface IUserLoginFail{
    _id: string
    username: string
    userAgent?: string
    ip?: string
    createdAt?: string
    updatedAt?: string
}

interface IUserLoginFailBase{
    username: string
    userAgent?: string
    ip?: string
}

export {IUserLoginFail, IUserLoginFailBase}
