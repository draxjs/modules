import type {IGqlClient} from '@drax/common-front'
import type {ITenantProvider} from "../../interfaces/ITenantProvider";
import type {ITenant, ITenantBase} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";


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

    async create(payload: ITenantBase): Promise<any> {
        const query: string = `mutation createTenant($input: TenantInput) { 
        createTenant(input: $input) {id name } 
        }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createTenant
    }

    async update(id: string, payload: ITenantBase): Promise<ITenant> {
        const query: string = `mutation updateTenant($id: ID!, $input: TenantInput) { updateTenant(id: $id, input: $input) {  
        id name  } }`
        const variables = {id, input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.updateTenant
    }

    async delete(id: string): Promise<any> {
        const query: string = `mutation deleteTenant($id: ID!) { deleteTenant(id: $id) }`
        const variables = {id: id}
        let data = await this.gqlClient.mutation(query, variables)
        return data.deleteTenant
    }

    async paginate({page= 1, limit= 5, orderBy="", order=false, search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>> {
        const query: string = `query paginateTenant($options: PaginateOptions) { 
            paginateTenant(options: $options) { 
                total page limit items{ id name createdAt updatedAt } 
            } 
        }`
        const variables = {options: {page, limit, orderBy, order, search}}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateTenant
    }


}

export default TenantGqlProvider
