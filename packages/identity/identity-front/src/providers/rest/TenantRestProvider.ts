import type {IHttpClient, IPaginateClient} from '@drax/common-front'
import type {ITenantProvider} from "../../interfaces/ITenantProvider.ts";
import type {ITenant} from "../../interfaces/ITenant";

class TenantRestProvider implements ITenantProvider {

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


    async fetchTenant(): Promise<any> {
        const url = '/api/tenants/all'
        let tenant = await this.httpClient.get(url)
        return tenant
    }

    async createTenant(data: ITenant): Promise<any> {
            const url = '/api/tenants'
            let tenant = await this.httpClient.post(url, data)
            return tenant
    }
    async editTenant(id: string, data: ITenant): Promise<ITenant> {
        const url = '/api/tenants/' + id
        let user = await this.httpClient.put(url, data)
        return user as ITenant
    }

    async deleteTenant(id: string): Promise<any> {
        const url = '/api/tenants/' + id
        let user = await this.httpClient.delete(url)
        return user
    }

    async paginateTenant(page: number = 1, limit: number = 5, search:string=""): Promise<IPaginateClient> {
        const url = '/api/tenants'
        const params = {page, limit, search}
        let paginatedTenants = await this.httpClient.get(url, {params})
        return paginatedTenants as IPaginateClient

    }


}

export default TenantRestProvider
