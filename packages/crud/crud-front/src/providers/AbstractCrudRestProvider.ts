import {HttpRestClientFactory} from "@drax/common-front";
import type {IHttpClient} from '@drax/common-front'
import type {
    IDraxCrudProvider, IDraxCrudProviderExportResult,
    IDraxPaginateResult, IDraxPaginateOptions,
    IDraxFieldFilter, IDraxExportOptions
} from "@drax/crud-share";

class AbstractCrudRestProvider<T, C, U> implements IDraxCrudProvider<T, C, U> {

    httpClient: IHttpClient
    basePath: string = '/api/entity'

    constructor(basePath: string = '/api/entity') {
        this.httpClient = HttpRestClientFactory.getInstance()
        this.setBasePath(basePath)
    }

    setBasePath(basePath: string) {
        this.basePath = basePath
    }

    async create(data: C): Promise<T> {
        const url = this.basePath
        const item = await this.httpClient.post(url, data)
        return item as T
    }

    async update(id: string, data: U): Promise<T> {
        const url = this.basePath + '/' + id
        const item = await this.httpClient.put(url, data)
        return item as T
    }

    async delete(id: string): Promise<any> {
        const url = this.basePath + '/' + id
        const item = await this.httpClient.delete(url)
        return item
    }

    async search(search: string): Promise<T[]> {
        const url = this.basePath + '/search'
        const params = {search}
        const items = await this.httpClient.get(url, {params})
        return items as T[]
    }

    async findById(id: string): Promise<T> {
        const url = this.basePath + '/' + id
        const item = await this.httpClient.get(url)
        return item as T
    }

    async findByIds(ids: Array<string>): Promise<T[]> {
        const url = this.basePath + '/ids/' + ids.join(',')
        const item = await this.httpClient.get(url)
        return item as T[]
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = "",
                       order = false,
                       search = "",
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>> {
        const url = this.basePath
        const sFilters: string = filters.map((filter : IDraxFieldFilter ) => `${filter.field},${filter.operator},${filter.value}`).join('|')
        const params: any = {page, limit, orderBy, order, search, filters: sFilters}
        const paginatedItems = await this.httpClient.get(url, {params})
        return paginatedItems as IDraxPaginateResult<T>

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
        const url = this.basePath + '/export'
        const sFilters: string  = filters.map((filter : IDraxFieldFilter ) => `${filter.field},${filter.operator},${filter.value}`).join('|')
        const params: any = {format, headers, separator, limit, orderBy, order, search, filters: sFilters}
        return await this.httpClient.get(url, {params}) as IDraxCrudProviderExportResult

    }


}

export {AbstractCrudRestProvider}
export default AbstractCrudRestProvider