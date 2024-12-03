
interface ILanguageBase {
    name: string
    createdAt?: Date
    updatedAt?: Date
}

interface ILanguage {
    id: string
    name: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ILanguageBase, 
ILanguage
}
