import type {IHttpClient} from '@drax/common-front'
import type {ITenantProvider} from "../../interfaces/ITenantProvider.ts";
import type {ITenant, ITenantBase} from "@drax/identity-share";
import type {
    IDraxCrudProviderExportResult,
    IDraxExportOptions, IDraxFieldFilter,
    IDraxPaginateOptions,
    IDraxPaginateResult
} from "@drax/crud-share";

class TenantRestProvider implements ITenantProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }



    async fetchTenant(): Promise<any> {
        const url = '/api/tenants/all'
        let tenant = await this.httpClient.get(url)
        return tenant
    }

    async create(data: ITenantBase): Promise<any> {
            const url = '/api/tenants'
            let tenant = await this.httpClient.post(url, data)
            return tenant
    }
    async update(id: string, data: ITenantBase): Promise<ITenant> {
        const url = '/api/tenants/' + id
        let user = await this.httpClient.put(url, data)
        return user as ITenant
    }

    async delete(id: string): Promise<any> {
        const url = '/api/tenants/' + id
        let user = await this.httpClient.delete(url)
        return user
    }

    async paginate({page= 1, limit= 5, orderBy="", order= "asc", search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>> {
        const url = '/api/tenants'
        const params = {page, limit, orderBy, order, search}
        let paginatedTenants = await this.httpClient.get(url, {params})
        return paginatedTenants as IDraxPaginateResult<ITenant>

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
        const url =  '/api/tenants/export'
        const sFilters: string  = filters.map((filter : IDraxFieldFilter ) => `${filter.field},${filter.operator},${filter.value}`).join('|')
        const params: any = {format, headers, separator, limit, orderBy, order, search, filters: sFilters}
        return await this.httpClient.get(url, {params}) as IDraxCrudProviderExportResult
    }

    async search(search: any): Promise<any> {
        const url = '/api/tenants/search'
        const params = {search}
        let tenants = await this.httpClient.get(url, {params} )
        return tenants
    }


}

export default TenantRestProvider
