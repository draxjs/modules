import type {IDraxFieldFilter} from "./IDraxFieldFilter";

interface IDraxPaginateOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDesc?: boolean;
  search?: string;
  filters?: IDraxFieldFilter[];
}

export type {IDraxPaginateOptions}
