import type {IDraxFieldFilter} from "./IDraxFieldFilter";

type IDraxGroupByDateFormat = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'

interface IDraxGroupByOptions {
  fields?: string[];
  filters?: IDraxFieldFilter[];
  dateFormat?: IDraxGroupByDateFormat;
}

export type {IDraxGroupByOptions, IDraxGroupByDateFormat}
