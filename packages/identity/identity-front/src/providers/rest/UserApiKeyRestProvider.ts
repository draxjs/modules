import type {IHttpClient} from '@drax/common-front'
import type {IUserApiKeyProvider} from "../../interfaces/IUserApiKeyProvider";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {AbstractBaseRestProvider} from "@drax/crud-front";


class UserApiKeyRestProvider extends AbstractBaseRestProvider implements IUserApiKeyProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        super('/api/user-api-keys');
        this.httpClient = httpClient
    }


    async create(data: IUserApiKeyBase): Promise<IUserApiKey> {
            const url = '/api/user-api-keys'
            let userApiKey = await this.httpClient.post(url, data)
            return userApiKey as IUserApiKey
    }

    async update(id: string, data: IUserApiKeyBase): Promise<IUserApiKey> {
            const url = '/api/user-api-keys/' + id
            let userApiKey = await this.httpClient.put(url, data)
            return userApiKey as IUserApiKey
    }

    async delete(id: string): Promise<any> {
            const url = '/api/user-api-keys/' + id
            let result = await this.httpClient.delete(url)
            return result
    }

    async paginate({page= 1, limit= 5, orderBy="", order="asc", search = "", filters=[]}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>> {
        const url = '/api/user-api-keys'
        const params = {page, limit, orderBy, order, search, filters: this.prepareFilters(filters)  }
            let paginatedUserApiKeys = await this.httpClient.get(url, {params})
            return paginatedUserApiKeys as IDraxPaginateResult<IUserApiKey>

    }

    async search(search: any): Promise<any> {
        const url = '/api/user-api-keys/search'
        let params = {search}
        let userApiKeys = await this.httpClient.get(url, {params} )
        return userApiKeys
    }


}

export default UserApiKeyRestProvider
