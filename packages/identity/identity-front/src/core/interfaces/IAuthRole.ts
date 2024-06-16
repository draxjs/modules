
interface IAuthRole{
    id ?: string
    name: string
    permissions: string[]
    childRoles?: IAuthRole[]
    readonly: boolean
}

export type {IAuthRole}
