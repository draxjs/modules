import type {IDraxFieldFilter} from "./IDraxFieldFilter";

interface IDraxPaginateOptions {
  page: number;
  limit: number;
  orderBy?: string;
  order?: 'asc' | 'desc' | boolean;
  search?: string;
  filters?: IDraxFieldFilter[];
}

export type {IDraxPaginateOptions}
