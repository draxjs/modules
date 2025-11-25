import type {IUserLoginFail} from "@drax/identity-share";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult,
    IDraxGroupByOptions
} from "@drax/crud-share";


interface IUserLoginFailProvider{
    paginate(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserLoginFail>>
    groupBy?(options: IDraxGroupByOptions): Promise<Array<any>>
    export?(options: IDraxExportOptions): Promise<IDraxCrudProviderExportResult>
}

export type {IUserLoginFailProvider}
