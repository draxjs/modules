interface IEntityCrudField {
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'array.string' | 'array.number' | 'array.object' | 'array.ref'
    ref?: string
    objectFields?: IEntityCrudField[]
    label: string,
    default: any
}

export type { IEntityCrudField }
