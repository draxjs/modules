
interface IPersonBase {
    fullname: string
    live: boolean
    birthdate: Date
    nationality: any
    hobbies: Array<string>
    languages: Array<any>
    address: {    country: string
    city: string
    street: string
    zip: string}
    skills: Array<{
    name: string
    level: number
    }>
    createdAt?: Date
    updatedAt?: Date
}

interface IPerson {
    id: string
    fullname: string
    live: boolean
    birthdate: Date
    nationality: any
    hobbies: Array<string>
    languages: Array<any>
    address: {    country: string
    city: string
    street: string
    zip: string}
    skills: Array<{
    name: string
    level: number
    }>
    createdAt?: Date
    updatedAt?: Date
}

export type {
IPersonBase, 
IPerson
}