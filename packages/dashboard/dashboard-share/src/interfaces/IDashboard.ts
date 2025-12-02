import {IEntityCrud} from "@drax/crud-share";

interface IDashboardCard{
    entity: string
    entityInstance?: IEntityCrud,
    type: 'paginate' | 'groupBy'
    title: string
    filters?: Array<{
        field: string
        operator: string
        value: any
    }>
    layout?: {
        cols: number
        sm: number
        md: number
        lg: number
        height: number
        cardVariant: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain" | undefined
    }
    groupBy?: {
        fields: Array<string>
        dateFormat?: "year" | "month" | "day" | "hour" | "minute" | "second";
        render?: string
    }
    paginate?: {
        columns: Array<string>
        orderBy?: string
        order?: string
    }
}
interface IDashboardBase {
    identifier: string
    title: string
    cards?: Array<IDashboardCard>
    createdAt?: Date
    updatedAt?: Date
}

interface IDashboard {
    _id: string
    identifier: string
    title: string
    cards?: Array<IDashboardCard>
    createdAt?: Date
    updatedAt?: Date
}

export type {
    IDashboardBase,
    IDashboard,
    IDashboardCard

}
