import type {IRoleProvider} from "../interfaces/IRoleProvider";
import type {IRole, IRoleBase} from "@drax/identity-share";
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

    async paginate({page= 1, limit= 5, orderBy="", order="asc", search = "", filters = []}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>> {
        return this._provider.paginate({page, limit, orderBy, order, search, filters})
    }

    async create(userPayload: IRoleBase):Promise<IRole> {
        if(!this._provider.create){
            throw new Error("Create method not implemented")
        }

        return this._provider.create(userPayload)
    }

    async update(id:string, userPayload: IRoleBase):Promise<IRole> {
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
            throw new Error(`RoleSystem.provider does not support export`)
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
