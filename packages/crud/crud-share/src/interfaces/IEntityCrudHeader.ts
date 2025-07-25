interface IEntityCrudHeader {
    title: string
    key: string
    align?: "start" | "end" | "center" | undefined
    sortable?: boolean
    minWidth?: string
    maxWidth?: string
    width?: string
    permission?: string,
    fixed?: 'start' | 'end' | undefined
}










export type {IEntityCrudHeader}
