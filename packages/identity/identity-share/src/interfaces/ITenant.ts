interface ITenantBase{
    _id?: string
    id?: string
    name: string,
    custom?: Record<String, any>
    createdAt?: string
    updatedAt?: string
}

interface ITenant{
    _id: string
    id?: string
    name: string
    custom?: Record<String, any>
    createdAt?: string
    updatedAt?: string
}


export {ITenant, ITenantBase}
