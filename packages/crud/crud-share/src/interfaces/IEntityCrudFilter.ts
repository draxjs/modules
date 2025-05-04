import type {IEntityCrudField} from "./IEntityCrudField";

interface IEntityCrudFilter extends IEntityCrudField  {
    operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like'
}

export type { IEntityCrudFilter }
