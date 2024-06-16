interface IRoleCreate{
    name: string
    permissions: string[]
    readonly : boolean
}

interface IRoleProvider {
    fetchRole(): Promise<any>
    createRole(input: IRoleCreate): Promise<any>
}

export type {IRoleProvider, IRoleCreate}
