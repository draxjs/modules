import type {IHttpClient} from "@drax/common-front";
import type {
  IDraxCrudProviderExportResult,
  IDraxExportOptions,
  IDraxFieldFilter,
  IDraxGroupByOptions,
  IDraxPaginateOptions,
  IDraxPaginateResult
} from "@drax/crud-share";
import {AbstractBaseRestProvider} from "@drax/crud-front";
import type {IUserLoginFail} from "@drax/identity-share";
import type {IUserLoginFailProvider} from "../../interfaces/IUserLoginFailProvider";

class UserLoginFailRestProvider extends AbstractBaseRestProvider implements IUserLoginFailProvider {

  httpClient: IHttpClient

  constructor(httpClient: IHttpClient) {
      super('/api/user-login-fails');
      this.httpClient = httpClient
  }

  async paginate({page= 1, limit= 5, orderBy="",order= "asc", search = "", filters= []}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserLoginFail>> {
    const url = '/api/user-login-fails'
    const params = {page, limit, orderBy, order, search, filters: this.prepareFilters(filters)}
    let paginatedUsers = await this.httpClient.get(url, {params})
    return paginatedUsers as IDraxPaginateResult<IUserLoginFail>
  }

  async groupBy({fields = [], filters = []}: IDraxGroupByOptions): Promise<Array<any>> {
    const url =  '/api/user-login-fails/group-by'
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
    const url =  '/api/user-login-fails/export'
    const params: any = {format, headers, separator, limit, orderBy, order, search,  filters: this.prepareFilters(filters)}
    return await this.httpClient.get(url, {params}) as IDraxCrudProviderExportResult
  }

}

export default UserLoginFailRestProvider

