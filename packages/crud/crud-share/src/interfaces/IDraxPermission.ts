interface IDraxPermission {
    Create: string
    Update: string
    Delete: string
    View: string
    Manage: string
    [key: string]: string
}

export type { IDraxPermission }
