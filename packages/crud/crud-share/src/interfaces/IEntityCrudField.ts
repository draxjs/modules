interface IEntityCrudField {
    name: string
    type: 'string' | 'longString' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'enum' | 'password' | 'file' | 'fullFile' |'array.string' | 'array.number' | 'array.object' | 'array.ref' | 'array.enum' | 'array.fullFile'
    ref?: string
    refDisplay?: string
    enum?: string[]
    objectFields?: IEntityCrudField[]
    label: string
    default: any
    prependIcon?: string
    prependInnerIcon?: string
    appendIcon?: string
    appendInnerIcon?: string
    permission?: string
    readonly?: boolean
    tab?:string
    menu?: string
    rows?:number //longString > textarea
    cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
}

export type { IEntityCrudField }
