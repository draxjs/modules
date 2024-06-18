import type {IHttpClient} from '@drax/common-front'
import type {IRoleProvider} from "../../interfaces/IRoleProvider.ts";
import type {IRole} from "../../interfaces/IRole";

class RoleRestProvider implements IRoleProvider {

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

    async createRole(data: IRole): Promise<any> {
            const url = '/api/roles'
            let role = await this.httpClient.post(url, data)
            return role
    }

    async fetchRole(): Promise<any> {
            const url = '/api/roles'
            let role = await this.httpClient.get(url)
            return role
    }
}

export default RoleRestProvider
