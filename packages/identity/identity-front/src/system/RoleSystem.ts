import type {IRoleProvider} from "../interfaces/IRoleProvider";
import type {IRole, IRoleBase, ITenant} from "@drax/identity-share";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";


class RoleSystem implements IRoleProvider {

    _provider: IRoleProvider
    prototype: string;

    constructor(provider: IRoleProvider) {
        this._provider = provider;
        this.prototype = 'RoleSystem'
    }

    async search(value: any):Promise<IRole[]> {

        if(!this._provider.search){
            throw new Error("Search method not implemented")
        }

        return this._provider.search(value)
    }

    fetchRole():Promise<IRole[]> {
        return this._provider.fetchRole()
    }

    fetchPermissions():Promise<any> {
        return this._provider.fetchPermissions()
    }

    async paginate({page= 1, limit= 5, orderBy="", order=false, search = "", filters = []}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>> {
        return this._provider.paginate({page, limit, orderBy, order, search, filters})
    }

    async create(userPayload: IRoleBase):Promise<IRole> {
        return this._provider.create(userPayload)
    }

    async update(id:string, userPayload: IRoleBase):Promise<IRole> {
        return this._provider.update(id, userPayload)
    }

    async delete(id: string):Promise<any> {
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
            throw new Error(`RoleSystem.provider does not support export`)  // assuming we have a custom error for this case  // replace with actual error handling as needed  // see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#error-handling-changes for more details on custom error classes in TypeScript 3.1+  // or use a library like 'ts-error' for a more robust and flexible error handling solution  // or use a custom error type if you want to have a specific error type for this operation  // or use a custom interface or class for the export result if you want to have a specific structure for the result  // or use a custom function that returns the result if you want to have a specific function for the result  // or use a custom interface or class if you want to have a specific structure for the result  // or use a custom function that returns the result
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

export default RoleSystem
export {RoleSystem}
