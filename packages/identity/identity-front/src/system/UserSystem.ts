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
        if(!this._provider.create){
            throw new Error("Create method not implemented")
        }

        return this._provider.create(userPayload)
    }

    async update(id:string, userPayload: IUserUpdate):Promise<IUser> {
        if(!this._provider.update){
            throw new Error("Update method not implemented")
        }

        return this._provider.update(id, userPayload)
    }

    async delete(id: string):Promise<any> {
        if(!this._provider.delete){
            throw new Error("Delete method not implemented")
        }

        return this._provider.delete(id)
    }

    async changeUserPassword(userId:string, newPassword:string):Promise<boolean> {
        if(!this._provider.changeUserPassword){
            throw new Error("changeUserPassword method not implemented")
        }

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
            throw new Error(`export method not implemented`)
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
