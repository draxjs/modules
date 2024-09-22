
interface ICountryBase {
    name: string
    createdAt?: Date
    updatedAt?: Date
}

interface ICountry {
    id: string
    name: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICountryBase, 
ICountry
}
