interface ITenantBase{
    id?: string
    name: string
}

interface ITenant{
    id: string
    name: string
    createdAt?: Date
    updatedAt?: Date
}


export {ITenant, ITenantBase}
