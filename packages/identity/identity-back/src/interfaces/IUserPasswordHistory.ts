interface IUserPasswordHistory {
    _id?: string
    id?: string
    user: string
    passwordHash: string
    createdAt?: string | Date
    updatedAt?: string | Date
}

interface IUserPasswordHistoryCreate {
    _id?: string
    id?: string
    user: string
    passwordHash: string
    createdAt?: string | Date
}

export type {
    IUserPasswordHistory,
    IUserPasswordHistoryCreate
}
