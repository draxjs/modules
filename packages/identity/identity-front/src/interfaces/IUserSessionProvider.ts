import type {IUserSession} from "@drax/identity-share";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult,
    IDraxGroupByOptions
} from "@drax/crud-share";


interface IUserSessionProvider{
    paginate(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserSession>>
    groupBy?(options: IDraxGroupByOptions): Promise<Array<any>>
    export?(options: IDraxExportOptions): Promise<IDraxCrudProviderExportResult>
}

export type {IUserSessionProvider}
