import type {IHttpClient} from '@drax/common-front'
import type {IUserApiKeyProvider} from "../../interfaces/IUserApiKeyProvider";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxPaginateResult} from "@drax/common-share";


class UserApiKeyRestProvider implements IUserApiKeyProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }


    async create(data: IUserApiKeyBase): Promise<IUserApiKey> {
            const url = '/api/user-api-keys'
            let user = await this.httpClient.post(url, data)
            return user as IUserApiKey
    }

    async update(id: string, data: IUserApiKeyBase): Promise<IUserApiKey> {
            const url = '/api/user-api-keys/' + id
            let user = await this.httpClient.put(url, data)
            return user as IUserApiKey
    }

    async delete(id: string): Promise<any> {
            const url = '/api/user-api-keys/' + id
            let user = await this.httpClient.delete(url)
            return user
    }

    async paginate({page= 1, limit= 5, orderBy="", orderDesc=false, search = ""}): Promise<IDraxPaginateResult<IUserApiKey>> {
        const url = '/api/user-api-keys'
        const params = {page, limit, orderBy, orderDesc, search}
            let paginatedUsers = await this.httpClient.get(url, {params})
            return paginatedUsers as IDraxPaginateResult<IUserApiKey>

    }




}

export default UserApiKeyRestProvider
