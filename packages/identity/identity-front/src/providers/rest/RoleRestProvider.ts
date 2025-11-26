import type {IHttpClient} from '@drax/common-front'
import type {IRoleProvider} from "../../interfaces/IRoleProvider.ts";
import type {IRole, IRoleBase} from "@drax/identity-share";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";
import {AbstractBaseRestProvider} from "@drax/crud-front";

class RoleRestProvider extends AbstractBaseRestProvider implements IRoleProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        super('/api/roles');
        this.httpClient = httpClient
    }


    async fetchPermissions(): Promise<any> {
        const url = '/api/permissions'
        let permissions = await this.httpClient.get(url)
        return permissions
    }

    async fetchRole(): Promise<any> {
        const url = '/api/roles/all'
        let role = await this.httpClient.get(url)
        return role
    }

    async create(data: IRoleBase): Promise<any> {
            const url = '/api/roles'
            let role = await this.httpClient.post(url, data)
            return role
    }
    async update(id: string, data: IRoleBase): Promise<IRole> {
        const url = '/api/roles/' + id
        let user = await this.httpClient.put(url, data)
        return user as IRole
    }

    async delete(id: string): Promise<any> {
        const url = '/api/roles/' + id
        let user = await this.httpClient.delete(url)
        return user
    }

    async paginate({page= 1, limit= 5, orderBy="", order= "asc", search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>> {
        const url = '/api/roles'
        const params = {page, limit, orderBy, order, search}
        let paginatedRoles = await this.httpClient.get(url, {params})
        return paginatedRoles as IDraxPaginateResult<IRole>

    }

    async search(search: any): Promise<any> {
        const url = '/api/roles/search'
        let params = {search}
        let roles = await this.httpClient.get(url, {params} )
        return roles
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
        const url =  '/api/roles/export'
        const params: any = {format, headers, separator, limit, orderBy, order, search, filters: this.prepareFilters(filters)}
        return await this.httpClient.get(url, {params}) as IDraxCrudProviderExportResult
    }

}

export default RoleRestProvider
