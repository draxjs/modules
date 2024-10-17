import type {IDraxCrud} from "./IDraxCrud";
import type {IDraxExportOptions} from "./IDraxExportOptions";
import type {IDraxExportResult} from "./IDraxExportResult";
import type {IDraxFieldFilter} from "./IDraxFieldFilter";

interface IDraxCrudService<T,C,U> extends IDraxCrud<T, C, U>  {
  search?(value: any, limit: number, filters: IDraxFieldFilter[]): Promise<T[]>
  export?(options: IDraxExportOptions, destinationPath:string): Promise<IDraxExportResult>
}

export type {IDraxCrudService}
