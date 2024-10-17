import type {IHttpClient} from '@drax/common-front'
import type {IUserApiKeyProvider} from "../../interfaces/IUserApiKeyProvider";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";


class UserApiKeyRestProvider implements IUserApiKeyProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
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

    async paginate({page= 1, limit= 5, orderBy="", order=false, search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>> {
        const url = '/api/user-api-keys'
        const params = {page, limit, orderBy, order, search}
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
