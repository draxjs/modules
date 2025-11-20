import type {IDraxFieldFilter} from "./IDraxFieldFilter";

interface IDraxGroupByOptions {
  fields: string[];
  filters?: IDraxFieldFilter[];
}

export type {IDraxGroupByOptions}
