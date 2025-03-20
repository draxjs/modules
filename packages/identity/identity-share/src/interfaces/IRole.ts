
type IRolePermissions = string[]

interface IRoleBase{
    _id?: string
    id?: string
    name: string
    permissions: string[]
    childRoles?: string[]
    readonly: boolean | number
    createdAt?: string
    updatedAt?: string
}

interface IRole{
    _id: string
    id?: string
    name: string
    permissions: IRolePermissions
    childRoles?: IRole[]
    readonly: boolean | number
    createdAt?: string
    updatedAt?: string
}


export {IRole, IRoleBase, IRolePermissions}
