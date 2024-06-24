interface IRoleBase{
    name: string
    permissions: string[]
    childRoles: string[]
    readonly: boolean
}

interface IRole{
    id : string
    name: string
    permissions: string[]
    childRoles: IRole[]
    readonly: boolean
}




export type {IRole, IRoleBase}
