interface IDraxPermission {
    View: string
    Manage: string

    Create?: string
    Update?: string
    Delete?: string

    All?: string
    ViewAll?: string
    UpdateAll?: string
    DeleteAll?: string

    [key: string]: string
}

export type { IDraxPermission }
