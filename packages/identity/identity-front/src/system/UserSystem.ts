import type {IUserProvider} from "../interfaces/IUserProvider";
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions, IDraxGroupByOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";


class UserSystem implements IUserProvider{

    _provider: IUserProvider
    prototype: string;

    constructor(provider: IUserProvider) {
        this._provider = provider;
        this.prototype = 'UserSystem'
    }

    async search(value: any):Promise<IUser[]> {

        if(!this._provider.search){
            throw new Error("search method not implemented")
        }

        return this._provider.search(value)
    }

    async paginate({page= 1, limit= 5, orderBy= "", order= "asc", search = "", filters = []}: IDraxPaginateOptions):Promise<IDraxPaginateResult<IUser>> {
        return this._provider.paginate({page, limit, orderBy, order, search, filters})
    }

    async create(userPayload: IUserCreate):Promise<IUser> {
        return this._provider.create(userPayload)
    }

    async update(id:string, userPayload: IUserUpdate):Promise<IUser> {
        return this._provider.update(id, userPayload)
    }

    async delete(id: string):Promise<any> {
        return this._provider.delete(id)
    }

    async changeUserPassword(userId:string, newPassword:string):Promise<boolean> {
        const result: boolean = await this._provider.changeUserPassword(userId,newPassword)
        return result
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

export default UserSystem
export {UserSystem}
