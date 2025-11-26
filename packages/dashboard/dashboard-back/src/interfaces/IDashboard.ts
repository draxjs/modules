
interface IDashboardBase {
    identifier: string
    title: string
    cards?: Array<{
    entity: string
    type: string
    title: string
    filters?: Array<{
    field: string
    operator: string
    value: string
    }>
    layout?: {    cols: number
    sm: number
    md: number
    lg: number
    height: number
    cardVariant: string}
    groupBy?: {    fields: Array<string>
    dateFormat?: string
    render?: string}
    paginate?: {    columns: Array<string>
    orderBy?: string
    order?: string}
    }>
    createdAt?: Date
    updatedAt?: Date
}

interface IDashboard {
    _id: string
    identifier: string
    title: string
    cards?: Array<{
    entity: string
    type: string
    title: string
    filters?: Array<{
    field: string
    operator: string
    value: string
    }>
    layout?: {    cols: number
    sm: number
    md: number
    lg: number
    height: number
    cardVariant: string}
    groupBy?: {    fields: Array<string>
    dateFormat?: string
    render?: string}
    paginate?: {    columns: Array<string>
    orderBy?: string
    order?: string}
    }>
    createdAt?: Date
    updatedAt?: Date
}

export type {
IDashboardBase, 
IDashboard
}
