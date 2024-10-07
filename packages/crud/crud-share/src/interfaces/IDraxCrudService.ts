import {IDraxCrud} from "./IDraxCrud";
import {IDraxExportOptions} from "./IDraxExportOptions";
import {IDraxExportResult} from "./IDraxExportResult";

interface IDraxCrudService<T,C,U> extends IDraxCrud<T, C, U>  {

  export?(options: IDraxExportOptions, destinationPath:string): Promise<IDraxExportResult>
}

export type {IDraxCrudService}
