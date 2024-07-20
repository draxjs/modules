
type IRolePermissions = string[]

interface IRoleBase{
    id?: string
    name: string
    permissions: string[] | string
    childRoles?: string[] | string
    readonly: boolean | number
    createdAt?: string
    updatedAt?: string
}

interface IRole{
    id: string
    name: string
    permissions: IRolePermissions
    childRoles?: IRole[]
    readonly: boolean | number
    createdAt?: string
    updatedAt?: string
}


export {IRole, IRoleBase, IRolePermissions}
