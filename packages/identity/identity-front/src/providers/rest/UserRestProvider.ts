import type {IHttpClient} from '@drax/common-front'
import type {IUserProvider, IUserCreate} from "../../interfaces/IUserProvider.ts";

class UserRestProvider implements IUserProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }

    setHttpClientToken(token: string): void {
        this.httpClient.addHeader('Authorization', `Bearer ${token}`)
    }

    removeHttpClientToken(): void {
        this.httpClient.removeHeader('Authorization')
    }

    async createUser(data: IUserCreate): Promise<any> {
        const url = '/api/users'
        let user = await this.httpClient.post(url, data)
        return user
    }

    async paginateUser(page: number = 1, limit: number = 5): Promise<any> {
        const url = '/api/users'
        const params = {page, limit}
        let paginatedUsers = await this.httpClient.get(url, {params})
        return paginatedUsers
    }
}

export default UserRestProvider
