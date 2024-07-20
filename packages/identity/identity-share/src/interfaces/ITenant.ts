interface ITenantBase{
    id?: string
    name: string
    createdAt?: string
    updatedAt?: string
}

interface ITenant{
    id: string
    name: string
    createdAt?: string
    updatedAt?: string
}


export {ITenant, ITenantBase}
