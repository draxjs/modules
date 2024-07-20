import type {IGqlClient} from '@drax/common-front'
import type {IRoleProvider} from "../../interfaces/IRoleProvider";
import type {IRole, IRoleBase} from "@drax/identity-share";
import type {IDraxPaginateResult} from "@drax/common-share";


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

    async fetchPermissions(): Promise<any> {
        const query: string = `query fetchPermissions { fetchPermissions }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchPermissions
    }

    async fetchRole(): Promise<IRole[]> {
        const query: string = `query fetchRole { fetchRole { id name permissions childRoles{id name} readonly } }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchRole
    }

    async create(payload: IRoleBase): Promise<IRole> {
        const query: string = `mutation createRole($input: RoleInput) { 
        createRole(input: $input) {id name permissions childRoles{id name} readonly } 
        }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createRole
    }

    async update(id: string, payload: IRoleBase): Promise<IRole> {
        const query: string = `mutation updateRole($id: ID!, $input: RoleInput) { updateRole(id: $id, input: $input) {  
        id name permissions childRoles{id name} readonly  } }`
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

    async paginate({page= 1, limit= 5, orderBy="", orderDesc=false, search = ""}): Promise<IDraxPaginateResult<IRole>> {
        const query: string = `query paginateRole($options: PaginateOptions) { 
            paginateRole(options: $options) { 
                total, page, limit, items{id name permissions childRoles{id name} readonly } 
            } 
        }`
        const variables = {options: {page, limit, orderBy, orderDesc, search}}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateRole
    }


}

export default RoleGqlProvider
