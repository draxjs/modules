
interface ICountryBase {
    name: string
    flag: string
    createdAt?: Date
    updatedAt?: Date
}

interface ICountry {
    id: string
    name: string
    flag: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICountryBase, 
ICountry
}
