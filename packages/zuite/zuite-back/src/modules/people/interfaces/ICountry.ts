
interface ICountryBase {
    name: string
    description?: string
    flag?: string
    createdAt?: Date
    updatedAt?: Date
    company?: any
    createdBy?: any
}

interface ICountry {
    _id: string
    name: string
    description?: string
    flag?: string
    createdAt?: Date
    updatedAt?: Date
    company?: any
    createdBy?: any
}

export type {
ICountryBase,
ICountry
}
