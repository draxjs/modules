
interface ICountryBase {
    name: string
    description?: string
    flag?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ICountry {
    _id: string
    name: string
    description?: string
    flag?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICountryBase, 
ICountry
}
