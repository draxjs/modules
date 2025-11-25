import {HttpRestClientFactory} from "@drax/common-front";
import type {IHttpClient} from '@drax/common-front'
import type {
    IDraxCrudProvider, IDraxCrudProviderExportResult,
    IDraxPaginateResult, IDraxPaginateOptions,
    IDraxFieldFilter, IDraxExportOptions, IDraxFindOptions, IDraxFindOneOptions, IDraxGroupByOptions
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
        const items = await this.httpClient.get(url)
        return items as T[]
    }

    async find({limit = 100, orderBy = "",order = false,search = "", filters = []}: IDraxFindOptions): Promise<T[]> {
        const url = this.basePath + '/find'
        const params = {limit, orderBy, order, search,filters: this.prepareFilters(filters)}
        const items = await this.httpClient.get(url, {params})
        return items as T[]
    }

    async groupBy({fields = [], filters = [], dateFormat = 'day'}: IDraxGroupByOptions): Promise<Array<any>> {
        const url = this.basePath + '/group-by'
        const params = {
            fields: fields ? fields.join(',') : '',
            filters: this.prepareFilters(filters),
            dateFormat: dateFormat
        }
        const items = await this.httpClient.get(url, {params})
        return items as T[]
    }

    async findOne({search = "", filters = []}: IDraxFindOneOptions): Promise<T> {
        const url = this.basePath + '/find-one'
        const params = {search, filters: this.prepareFilters(filters)}
        const items = await this.httpClient.get(url, {params})
        return items as T
    }

    prepareFilters(filters: IDraxFieldFilter[]) {
        const isDate = (value: any): value is Date => value instanceof Date;

        return filters
            .filter((filter: IDraxFieldFilter) => filter.value !== null && filter.value !== '' && filter.value !== undefined)
            .map((filter: IDraxFieldFilter) => {
                let value = isDate(filter.value)? filter.value.toISOString() : (Array.isArray(filter.value) ? filter.value.join(',') : filter.value)
                return `${filter.field};${filter.operator ? filter.operator : 'eq'};${value}`
            })
            .join('|')
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = "",
                       order = "asc",
                       search = "",
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<T>> {
        const url = this.basePath
        const params: any = {page, limit, orderBy, order, search, filters: this.prepareFilters(filters)}
        const paginatedItems = await this.httpClient.get(url, {params})
        return paginatedItems as IDraxPaginateResult<T>

    }

    async export({
                     format = 'JSON',
                     headers = [],
                     headersTranslate = [],
                     separator = ';',
                     fileName = 'export',
                     limit = 0,
                     orderBy = "",
                     order = false,
                     search = "",
                     filters = []
                 }: IDraxExportOptions): Promise<IDraxCrudProviderExportResult> {
        const url = this.basePath + '/export'
        const params: any = {
            format,
            headers,
            headersTranslate,
            separator,
            fileName,
            limit,
            orderBy,
            order,
            search,
            filters: this.prepareFilters(filters)
        }
        return await this.httpClient.get(url, {params}) as IDraxCrudProviderExportResult

    }


}

export {AbstractCrudRestProvider}
export default AbstractCrudRestProvider
