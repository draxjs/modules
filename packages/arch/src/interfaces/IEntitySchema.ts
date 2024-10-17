type IType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'enum' | 'password' | 'array.string' | 'array.number' | 'array.object' | 'array.ref' | 'array.enum'

interface IFieldSchema{
    type: IType
    required?: boolean
    index?: boolean
    search?: boolean
    unique?: boolean
    default?: any
    enum?: string[]
    ref?: string
    refDisplay?: string
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
