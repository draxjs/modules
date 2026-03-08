import type {IEntityCrudField} from "./IEntityCrudField";

type IEntityCrudFilterOperators = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like'

interface IEntityCrudFilter extends IEntityCrudField  {
    operator?: IEntityCrudFilterOperators
    value?: string | boolean | number | null | undefined;
}

export type { IEntityCrudFilter, IEntityCrudFilterOperators }
