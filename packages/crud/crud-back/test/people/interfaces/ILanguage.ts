
interface ILanguageBase {
    name: string
    icon?: {
                filename: string,
                filepath: string,
                size: number,
                mimetype?: string,
                url: string
                }
    createdAt?: Date
    updatedAt?: Date
}

interface ILanguage {
    _id: string
    name: string
    icon?: {
                filename: string,
                filepath: string,
                size: number,
                mimetype?: string,
                url: string
                }
    createdAt?: Date
    updatedAt?: Date
}

export type {
ILanguageBase, 
ILanguage
}
