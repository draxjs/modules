interface IEntityCrudField {
    name: string
    type: 'string' | 'longString' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'enum' | 'password' | 'file' |'array.string' | 'array.number' | 'array.object' | 'array.ref' | 'array.enum'
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
}

export type { IEntityCrudField }
