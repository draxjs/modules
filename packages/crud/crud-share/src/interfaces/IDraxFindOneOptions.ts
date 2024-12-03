import type {IDraxFieldFilter} from "./IDraxFieldFilter";

interface IDraxFindOneOptions {
  search?: string;
  filters?: IDraxFieldFilter[];
}

export type {IDraxFindOneOptions}
