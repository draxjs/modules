import type {IEntityCrudField} from "./IEntityCrudField";

type IEntityCrudFilterOperators = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'empty' | 'range'

interface IEntityCrudFilter extends IEntityCrudField  {
    operator?: IEntityCrudFilterOperators
    value?: any;
}

export type { IEntityCrudFilter, IEntityCrudFilterOperators }
