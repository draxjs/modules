
interface IRole{
    id ?: string
    name: string
    permissions: string[]
    childRoles?: IRole[]
    readonly: boolean
}

export type {IRole}
