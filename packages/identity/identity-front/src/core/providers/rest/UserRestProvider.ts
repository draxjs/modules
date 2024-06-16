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

    async createUser(params: IUserCreate): Promise<any> {
        const {username, email, password, role} = params
        return null
    }

    async paginateUser(page: number, limit: number): Promise<any> {

        return null
    }
}

export default UserRestProvider
