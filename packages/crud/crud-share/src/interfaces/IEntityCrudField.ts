import {IEntityCrudFieldSelectItem} from "./IEntityCrudFieldSelectItem";

interface IEntityCrudField {
    name: string
    type: 'id' |'string' | 'longString' | 'number' | 'boolean' | 'date' | 'object' | 'record' | 'ref' | 'enum' | 'select' |'password' | 'file' | 'fullFile' |'array.string' | 'array.number' | 'array.object' | 'array.record' | 'array.ref' | 'array.enum' | 'array.fullFile'
    ref?: string
    refDisplay?: string
    enum?: string[]
    items?: IEntityCrudFieldSelectItem[]
    objectFields?: IEntityCrudField[]
    label: string
    default: any
    prependIcon?: string
    prependInnerIcon?: string
    appendIcon?: string
    appendInnerIcon?: string
    permission?: string
    readonly?: boolean
    hint?: string
    persistentHint?: boolean
    arrayObjectUI ?: 'menu' | 'accordion' | 'chips'
    menuMaxHeight?: string
    groupTab?:string //Group Tabs
    groupMenu?: string //Group Menu
    rows?:number //longString > textarea
    cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    noFilter?: boolean
    addOnTheFly?:boolean
    endOfDay?: boolean
    showEndOfDayChip?: boolean
    max?: string
}

export type { IEntityCrudField }
