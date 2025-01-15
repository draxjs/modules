import type {IHttpClient} from '@drax/common-front'
import type {IUserProvider} from "../../interfaces/IUserProvider.ts";
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions, IDraxFieldFilter,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";


class UserRestProvider implements IUserProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }


    async create(data: IUserCreate): Promise<IUser> {
            const url = '/api/users'
            let user = await this.httpClient.post(url, data)
            return user as IUser
    }

    async update(id: string, data: IUserUpdate): Promise<IUser> {
            const url = '/api/users/' + id
            let user = await this.httpClient.put(url, data)
            return user as IUser
    }

    async delete(id: string): Promise<any> {
            const url = '/api/users/' + id
            let user = await this.httpClient.delete(url)
            return user
    }

    async paginate({page= 1, limit= 5, orderBy="", order=false, search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUser>> {
        const url = '/api/users'
        const params = {page, limit, orderBy, order, search}
            let paginatedUsers = await this.httpClient.get(url, {params})
            return paginatedUsers as IDraxPaginateResult<IUser>

    }

    async search(search: any): Promise<any> {
        const url = '/api/users/search'
        const params = {search}
        let users = await this.httpClient.get(url, {params} )
        return users
    }

    async changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
        const url = '/api/users/password/change/' + userId
        const data = {userId, newPassword}
        let r = await this.httpClient.post(url, data)
        return /true/i.test(r as string)
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
        const url =  '/api/users/export'
        const sFilters: string  = filters.map((filter : IDraxFieldFilter ) => `${filter.field},${filter.operator},${filter.value}`).join('|')
        const params: any = {format, headers, separator, limit, orderBy, order, search, filters: sFilters}
        return await this.httpClient.get(url, {params}) as IDraxCrudProviderExportResult
    }


}

export default UserRestProvider
