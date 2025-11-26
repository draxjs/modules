interface IEntityCrudPermissions {
    manage: string
    view: string

    create?: string
    update?: string
    delete?: string

    all?: string
    viewAll?: string
    updateAll?: string
    deleteAll?: string
}

export type { IEntityCrudPermissions }
