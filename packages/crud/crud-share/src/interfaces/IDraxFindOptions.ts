import type {IDraxFieldFilter} from "./IDraxFieldFilter";

interface IDraxFindOptions {
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc' | boolean;
  search?: string;
  filters?: IDraxFieldFilter[];
  cursor?: boolean;
}

export type {IDraxFindOptions}
