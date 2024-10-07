import type {IDraxCrud} from "./IDraxCrud";
import type {IDraxExportOptions} from "./IDraxExportOptions";
import type {IDraxCrudProviderExportResult} from "./IDraxCrudProviderExportResult";

interface IDraxCrudProvider<T,C,U> extends IDraxCrud<T, C, U>  {

  export?(options: IDraxExportOptions): Promise<IDraxCrudProviderExportResult>
}

export type {IDraxCrudProvider}
