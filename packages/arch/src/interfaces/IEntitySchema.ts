type IType = 'string' | 'longString' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'enum' | 'password' | 'file' |'array.string' | 'array.number' | 'array.object' | 'array.ref' | 'array.enum' | 'array.file'

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
    apiBasePath: string
    apiTag: string
    schema: ISchema
}

export type {IEntitySchema, ISchema, IFieldSchema, IType}
