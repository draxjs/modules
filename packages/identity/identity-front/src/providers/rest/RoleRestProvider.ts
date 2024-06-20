import type {IHttpClient, IPaginateClient} from '@drax/common-front'
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

    async fetchPermissions(): Promise<any> {
        const url = '/api/permissions'
        let permissions = await this.httpClient.get(url)
        return permissions
    }

    async fetchRole(): Promise<any> {
        const url = '/api/roles/all'
        let role = await this.httpClient.get(url)
        return role
    }

    async createRole(data: IRole): Promise<any> {
            const url = '/api/roles'
            let role = await this.httpClient.post(url, data)
            return role
    }
    async editRole(id: string, data: IRole): Promise<IRole> {
        const url = '/api/roles/' + id
        let user = await this.httpClient.put(url, data)
        return user as IRole
    }

    async deleteRole(id: string): Promise<any> {
        const url = '/api/roles/' + id
        let user = await this.httpClient.delete(url)
        return user
    }

    async paginateRole(page: number = 1, limit: number = 5): Promise<IPaginateClient> {
        const url = '/api/roles'
        const params = {page, limit}
        let paginatedRoles = await this.httpClient.get(url, {params})
        return paginatedRoles as IPaginateClient

    }


}

export default RoleRestProvider
