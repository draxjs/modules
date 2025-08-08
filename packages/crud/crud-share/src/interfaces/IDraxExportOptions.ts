import type {IDraxFieldFilter} from "./IDraxFieldFilter";

interface IDraxExportOptions {
  format: 'JSON' | 'CSV';
  headers?: string[] | string;
  separator: string;
  fileName?: string;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc' | boolean;
  search?: string;
  filters?: IDraxFieldFilter[];
}

export type {IDraxExportOptions}
