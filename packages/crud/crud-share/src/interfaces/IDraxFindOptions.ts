import type {IDraxFieldFilter} from "./IDraxFieldFilter";

interface IDraxFindOptions {
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc' | boolean;
  search?: string;
  filters?: IDraxFieldFilter[];
}

export type {IDraxFindOptions}
