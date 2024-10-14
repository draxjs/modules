interface IEntityCrudField {
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'array.string' | 'array.number' | 'array.object' | 'array.ref'
    ref?: string
    refDisplay?: string
    objectFields?: IEntityCrudField[]
    label: string
    default: any
    prependIcon?: string
    prependInnerIcon?: string
    appendIcon?: string
    appendInnerIcon?: string
}

export type { IEntityCrudField }
