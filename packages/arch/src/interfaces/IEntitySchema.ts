type IType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'array.string' | 'array.number' | 'array.object' | 'array.ref'

interface IFieldSchema{
    type: IType
    required?: boolean
    index?: boolean
    search?: boolean
    unique?: boolean
    default?: any
    ref?: string
    schema?: ISchema
    header?: boolean
    smCol?: number
    mdCol?: number
}

interface ISchema{
    [key: string]: IFieldSchema
}


interface IEntitySchema{
    name: string
    module: string
    schema: ISchema
}

export type {IEntitySchema, ISchema, IFieldSchema, IType}
