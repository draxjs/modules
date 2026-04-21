import type {IDraxFieldFilter} from "./IDraxFieldFilter";
import type {IEntityCrudFilter} from "./IEntityCrudFilter";

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

export type {ICrudSavedQueryBase, ICrudSavedQuery}
