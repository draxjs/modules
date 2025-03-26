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

    get gqlFields(){
        return `id name createdAt updatedAt`
    }


    async fetchTenant(): Promise<ITenant[]> {
        const query: string = `query fetchTenant { fetchTenant { ${this.gqlFields} } }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchTenant
    }

    async search(value: any): Promise<any> {
        const query: string = `query searchTenant($value: String) { searchTenant(value: $value) { ${this.gqlFields} } }`
        const variables = {value}
        let data = await this.gqlClient.query(query, variables)
        return data.searchTenant
    }

    async create(payload: ITenantBase): Promise<any> {
        const query: string = `mutation createTenant($input: TenantInput) { 
        createTenant(input: $input) { ${this.gqlFields} } 
        }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createTenant
    }

    async update(id: string, payload: ITenantBase): Promise<ITenant> {
        const query: string = `mutation updateTenant($id: ID!, $input: TenantInput) { updateTenant(id: $id, input: $input) {  
        ${this.gqlFields}  } }`
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

    async paginate({page= 1, limit= 5, orderBy="", order='asc', search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITenant>> {
        const query: string = `query paginateTenant($options: PaginateOptions) { 
            paginateTenant(options: $options) { 
                total page limit items{ ${this.gqlFields} } 
            } 
        }`
        const variables = {options: {page, limit, orderBy, order, search}}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateTenant
    }


}

export default TenantGqlProvider
