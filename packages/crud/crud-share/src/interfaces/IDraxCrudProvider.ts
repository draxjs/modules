import type {IDraxCrud} from "./IDraxCrud";
import type {IDraxExportOptions} from "./IDraxExportOptions";
import type {IDraxCrudProviderExportResult} from "./IDraxCrudProviderExportResult";
import type {IDraxImportResponse} from "./IDraxImportResponse";

interface IDraxCrudProvider<T,C,U> extends IDraxCrud<T, C, U>  {
  search?(value: any): Promise<T[]>
  export?(options: IDraxExportOptions): Promise<IDraxCrudProviderExportResult>
  import?(file: any, format: 'CSV' | 'JSON'): Promise<IDraxImportResponse>
}

export type {IDraxCrudProvider}
