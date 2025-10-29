interface IEntityCrudHeader {
    readonly title: string
    readonly key: string
    readonly align?: "start" | "end" | "center"  | undefined
    readonly sortable?: boolean
    readonly minWidth?: string
    readonly maxWidth?: string
    readonly width?: string
    readonly permission?: string,
    readonly fixed?: 'start' | 'end' | undefined
}










export type {IEntityCrudHeader}
