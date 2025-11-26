import type {IUserLoginFailProvider} from "../interfaces/IUserLoginFailProvider";
import type {IUserLoginFail} from "@drax/identity-share";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions, IDraxGroupByOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";


class UserLoginFailSystem implements IUserLoginFailProvider{

    _provider: IUserLoginFailProvider
    prototype: string;

    constructor(provider: IUserLoginFailProvider) {
        this._provider = provider;
        this.prototype = 'UserLoginFailSystem'
    }

    async paginate({page= 1, limit= 5, orderBy= "", order= "asc", search = "", filters = []}: IDraxPaginateOptions):Promise<IDraxPaginateResult<IUserLoginFail>> {
        return this._provider.paginate({page, limit, orderBy, order, search, filters})
    }

    async groupBy({fields = [], filters = []}: IDraxGroupByOptions): Promise<Array<any>> {
        if(!this._provider.groupBy){
            throw new Error("groupBy method not implemented")
        }

        const result: any[] = await this._provider.groupBy({fields,filters})
        return result
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
            throw new Error(`export method not implemented`)  // assuming we have a custom error for this case  // replace with actual error handling as needed  // see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#error-handling-changes for more details on custom error classes in TypeScript 3.1+  // or use a library like 'ts-error' for a more robust and flexible error handling solution  // or use a custom error type if you want to have a specific error type for this operation  // or use a custom interface or class for the export result if you want to have a specific structure for the result  // or use a custom function that returns the result if you want to have a specific function for the result  // or use a custom interface or class if you want to have a specific structure for the result  // or use a custom function that returns the result
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

export default UserLoginFailSystem
export {UserLoginFailSystem}
