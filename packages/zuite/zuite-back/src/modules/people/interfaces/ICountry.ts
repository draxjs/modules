
interface ICountryBase {
    name: string
    description?: string
    flag?: string
    metadata?: Record<string, any>
    tenant?: any
    createdBy: any
    notes: {
        date?: Date
        note: string
    }
    createdAt?: Date
    updatedAt?: Date
}

interface ICountry {
    _id: string
    name: string
    description?: string
    flag?: string
    metadata?: Record<string, any>
    notes: {
        date?: Date
        note: string
    }
    tenant?: any
    createdBy: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICountryBase,
ICountry
}
