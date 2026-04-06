import type {IDraxCrud} from "./IDraxCrud";
import type {IDraxExportOptions} from "./IDraxExportOptions";
import type {IDraxExportResult} from "./IDraxExportResult";
import type {IDraxFieldFilter} from "./IDraxFieldFilter";
import type {IDraxImportOptions} from "./IDraxImportOptions";
import type {IDraxImportResult} from "./IDraxImportResult";

interface IDraxCrudService<T,C,U> extends IDraxCrud<T, C, U>  {
  search?(value: any, limit: number, filters: IDraxFieldFilter[]): Promise<T[]>
  export?(options: IDraxExportOptions, destinationPath:string): Promise<IDraxExportResult>
  import?(options: IDraxImportOptions): Promise<IDraxImportResult>
  transformCreate?(data: C): Promise<C>
  transformUpdate?(data: U): Promise<U>
  transformRead?(data: T): Promise<T>
}

export type {IDraxCrudService}
