import type {IGqlClient} from '@drax/common-front'
import type {IRoleProvider} from "../../interfaces/IRoleProvider";
import type {IRole, IRoleBase} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";


class RoleGqlProvider implements IRoleProvider {

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
        return `id name permissions childRoles{id name} readonly`
    }

    async search(value: any): Promise<any> {
        const query: string = `query searchRole($value: String) { searchRole(value: $value) { ${this.gqlFields} } }`
        const variables = {value}
        let data = await this.gqlClient.query(query, variables)
        return data.searchRole
    }

    async fetchPermissions(): Promise<any> {
        const query: string = `query fetchPermissions { fetchPermissions }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchPermissions
    }

    async fetchRole(): Promise<IRole[]> {
        const query: string = `query fetchRole { fetchRole { ${this.gqlFields} } }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchRole
    }



    async create(payload: IRoleBase): Promise<IRole> {
        const query: string = `mutation createRole($input: RoleInput) { 
        createRole(input: $input) { ${this.gqlFields} } 
        }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createRole
    }

    async update(id: string, payload: IRoleBase): Promise<IRole> {
        const query: string = `mutation updateRole($id: ID!, $input: RoleInput) { updateRole(id: $id, input: $input) {  
        ${this.gqlFields}  } }`
        const variables = {id, input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.updateRole
    }

    async delete(id: string): Promise<any> {
        const query: string = `mutation deleteRole($id: ID!) { deleteRole(id: $id) }`
        const variables = {id: id}
        let data = await this.gqlClient.mutation(query, variables)
        return data.deleteRole
    }

    async paginate({page= 1, limit= 5, orderBy="", order='asc', search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>> {
        const query: string = `query paginateRole($options: PaginateOptions) { 
            paginateRole(options: $options) { 
                total, page, limit, items{ ${this.gqlFields} } 
            } 
        }`
        const variables = {options: {page, limit, orderBy, order, search}}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateRole
    }


}

export default RoleGqlProvider
