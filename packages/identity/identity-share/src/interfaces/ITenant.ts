interface ITenantBase{
    _id?: string
    id?: string
    name: string,
    custom?: Record<string, any>
    createdAt?: string
    updatedAt?: string
}

interface ITenant{
    _id: string
    id?: string
    name: string
    custom?: Record<string, any>
    createdAt?: string
    updatedAt?: string
}


export {ITenant, ITenantBase}
