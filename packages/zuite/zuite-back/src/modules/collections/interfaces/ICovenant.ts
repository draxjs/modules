
interface ICovenantBase {
    date: Date
    link?: string
    since: string
    until: string
    month: string
    fullname: string
    dni: string
    locality: string
    address: string
    amount: number
    comment?: string
    group: any
    createdBy: any
    updatedBy: any
    status?: string
    refuseComment?: string
    refuseBy?: any
    createdAt?: Date
    updatedAt?: Date
}

interface ICovenant {
    _id: string
    date: Date
    link?: string
    since: string
    until: string
    month: string
    fullname: string
    dni: string
    locality: string
    address: string
    amount: number
    comment?: string
    group: any
    createdBy: any
    updatedBy: any
    status?: string
    refuseComment?: string
    refuseBy?: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICovenantBase, 
ICovenant
}
