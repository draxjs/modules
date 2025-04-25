type FormValue =
    | string
    | number
    | boolean
    | Date
    | null
    | FormValue[]
    | { [key: string]: FormValue };

interface IEntityCrudForm {
    [key: string]: FormValue
}

export type { IEntityCrudForm }
