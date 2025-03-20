import type {ITenantProvider} from "../interfaces/ITenantProvider";
import type {ITenant, ITenantBase} from "@drax/identity-share";
import type {
    IDraxCrudProvider,
    IDraxCrudProviderExportResult,
    IDraxExportOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";

class TenantSystem implements IDraxCrudProvider<ITenant, ITenantBase, ITenantBase> {

    _provider: ITenantProvider
    prototype: string;

    constructor(provider: ITenantProvider) {
        this._provider = provider;
        this.prototype = 'TenantSystem'
    }

    fetchTenant(): Promise<any> {
        return this._provider.fetchTenant()
    }

    async search(value: any):Promise<ITenant[]> {

        if(!this._provider.search){
            throw new Error("Search method not implemented")
        }

        return this._provider.search(value)
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = "",
                       order = "asc",
                       search = "",
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>> {
        return this._provider.paginate({page, limit, orderBy, order, search, filters})
    }

    async create(userPayload: ITenantBase): Promise<ITenant> {
        return this._provider.create(userPayload)
    }

    async update(id: string, userPayload: ITenantBase): Promise<ITenant> {
        return this._provider.update(id, userPayload)
    }

    async delete(id: string): Promise<any> {
        return this._provider.delete(id)
    }

    async export({
                     format = 'JSON',
                     headers = [],
                     separator = ';',
                     limit = 0,
                     orderBy = "",
                     order = false,
                     search = "",
                     filters = []
                 }: IDraxExportOptions): Promise<IDraxCrudProviderExportResult> {

        if(!this._provider.export){
            throw new Error(`TenantSystem.provider does not support export`)  // assuming we have a custom error for this case  // replace with actual error handling as needed  // see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#error-handling-changes for more details on custom error classes in TypeScript 3.1+  // or use a library like 'ts-error' for a more robust and flexible error handling solution  // or use a custom error type if you want to have a specific error type for this operation  // or use a custom interface or class for the export result if you want to have a specific structure for the result  // or use a custom function that returns the result if you want to have a specific function for the result  // or use a custom interface or class if you want to have a specific structure for the result  // or use a custom function that returns the result
        }

        return this._provider.export({
            format,
            headers,
            separator,
            limit,
            orderBy,
            order,
            search,
            filters
        })
    }


}

export default TenantSystem
export {TenantSystem}
