import type {IHttpClient} from "@drax/common-front";
import type {
  IDraxCrudProviderExportResult,
  IDraxExportOptions,
  IDraxFieldFilter,
  IDraxGroupByOptions,
  IDraxPaginateOptions,
  IDraxPaginateResult
} from "@drax/crud-share";
import type {IUserSession} from "@drax/identity-share";
import type {IUserSessionProvider} from "../../interfaces/IUserSessionProvider";

class UserSessionRestProvider implements IUserSessionProvider {

  httpClient: IHttpClient

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient
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

  async paginate({page= 1, limit= 5, orderBy="",order= "asc", search = "", filters=[]}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserSession>> {
    const url = '/api/user-sessions'
    const params = {page, limit, orderBy, order, search, filters: this.prepareFilters(filters)}
    let paginatedUsers = await this.httpClient.get(url, {params})
    return paginatedUsers as IDraxPaginateResult<IUserSession>
  }

  async groupBy({fields = [], filters = []}: IDraxGroupByOptions): Promise<Array<any>> {
    const url =  '/api/user-sessions/group-by'
    const params = {fields: fields ? fields.join(',') : '',filters: this.prepareFilters(filters)}
    const items = await this.httpClient.get(url, {params})
    return items as any[]
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
    const url =  '/api/user-sessions/export'
    const sFilters: string  = filters.map((filter : IDraxFieldFilter ) => `${filter.field},${filter.operator},${filter.value}`).join('|')
    const params: any = {format, headers, separator, limit, orderBy, order, search, filters: sFilters}
    return await this.httpClient.get(url, {params}) as IDraxCrudProviderExportResult
  }

}

export default UserSessionRestProvider

