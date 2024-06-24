interface ITenantBase{
    name: string
}

interface ITenant extends ITenantBase{
    id: string
    name: string
}


export type {ITenant, ITenantBase}
