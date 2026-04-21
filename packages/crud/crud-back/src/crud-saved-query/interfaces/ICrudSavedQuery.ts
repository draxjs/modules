import type {IDraxFieldFilter, IEntityCrudFilter} from "@drax/crud-share/dist";

interface ICrudSavedQueryBase {
    entity: string
    name: string
    shared?: boolean
    columns: string[]
    staticFilters: IDraxFieldFilter[]
    dynamicFilters: IEntityCrudFilter[]
    tenant?: any
    user?: any
    createdAt?: Date
    updatedAt?: Date
}

interface ICrudSavedQuery extends ICrudSavedQueryBase {
    _id: string
}

export type {ICrudSavedQuery, ICrudSavedQueryBase};
