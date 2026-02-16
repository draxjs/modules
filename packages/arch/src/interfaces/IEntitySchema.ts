type IType = 'id' | 'string' | 'longString' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'enum' | 'password' | 'file' | 'fullFile' |'array.string' | 'array.number' | 'array.object' | 'array.ref' | 'array.enum' | 'array.file' | 'array.fullFile'

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
    lgCol?: number
    xlCol?: number
    groupTab?: string
    groupMenu?: string,
    tenantField?: string
    userField?: string
}

interface ISchema{
    [key: string]: IFieldSchema
}


interface IEntitySchema{
    name: string
    module: string
    identifier?: string
    apiBasePath?: string
    collectionName?: string
    apiTag?: string
    schema: ISchema
    tabs?: string[]
    menus?: string[]
}

export type {IEntitySchema, ISchema, IFieldSchema, IType}
