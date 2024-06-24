import type {IGqlClient, IPaginateClient} from '@drax/common-front'
import type {ITenantProvider} from "../../interfaces/ITenantProvider";
import type {ITenant} from "../../interfaces/ITenant";


class TenantGqlProvider implements ITenantProvider {

    gqlClient: IGqlClient

    constructor(gqlClient: IGqlClient) {
        this.gqlClient = gqlClient
    }

    setHttpClientToken(token: string): void {
        this.gqlClient.addHeader('Authorization', `Bearer ${token}`)
    }

    removeHttpClientToken(): void {
        this.gqlClient.removeHeader('Authorization')
    }


    async fetchTenant(): Promise<ITenant[]> {
        const query: string = `query fetchTenant { fetchTenant { id name } }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchTenant
    }

    async createTenant(payload: ITenant): Promise<any> {
        const query: string = `mutation createTenant($input: TenantInput) { 
        createTenant(input: $input) {id name } 
        }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createTenant
    }

    async editTenant(id: string, payload: ITenant): Promise<ITenant> {
        const query: string = `mutation updateTenant($id: ID!, $input: TenantInput) { updateTenant(id: $id, input: $input) {  
        id name  } }`
        const variables = {id, input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createTenant
    }

    async deleteTenant(id: string): Promise<any> {
        const query: string = `mutation deleteTenant($id: ID!) { deleteTenant(id: $id) }`
        const variables = {id: id}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createTenant
    }

    async paginateTenant(page: number, limit: number, search:string = ""): Promise<IPaginateClient<ITenant>> {
        const query: string = `query paginateTenant($page: Int, $limit: Int, $search:String) { 
            paginateTenant(page: $page, limit: $limit, search: $search) { 
                total, page, limit, items{id, name } 
            } 
        }`
        const variables = {page, limit,search}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateTenant
    }


}

export default TenantGqlProvider
