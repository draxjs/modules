import type {IDraxCrud} from "./IDraxCrud";
import type {IDraxExportOptions} from "./IDraxExportOptions";
import type {IDraxCrudProviderExportResult} from "./IDraxCrudProviderExportResult";

interface IDraxCrudProvider<T,C,U> extends IDraxCrud<T, C, U>  {
  search?(value: any): Promise<T[]>
  export?(options: IDraxExportOptions): Promise<IDraxCrudProviderExportResult>
}

export type {IDraxCrudProvider}
