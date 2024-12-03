import type {IEntityCrudField} from "./IEntityCrudField";

interface IEntityCrudFilter extends IEntityCrudField  {
    operator: string
}

export type { IEntityCrudFilter }
