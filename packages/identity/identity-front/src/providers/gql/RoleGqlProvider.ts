import type {IGqlClient, IPaginateClient} from '@drax/common-front'
import type {IRoleProvider} from "../../interfaces/IRoleProvider";
import type {IRole} from "../../interfaces/IRole";


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

    async fetchRole(): Promise<any> {
        const query: string = `query fetchRole { fetchRole { id name permissions childRoles{id name} readonly } }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchRole
    }

    async createRole(payload: IRole): Promise<any> {
        const query: string = `mutation createRole($input: RoleInput) { 
        createRole(input: $input) {id name permissions childRoles{id name} readonly } 
        }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createRole
    }

    async editRole(id: string, payload: IRole): Promise<IRole> {
        const query: string = `mutation updateRole($id: ID!, $input: RoleInput) { updateRole(id: $id, input: $input) {  
        id name permissions childRoles{id name} readonly  } }`
        const variables = {id, input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createRole
    }

    async deleteRole(id: string): Promise<any> {
        const query: string = `mutation deleteRole($id: ID!) { deleteRole(id: $id) }`
        const variables = {id: id}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createRole
    }

    async paginateRole(page: number, limit: number, search:string = ""): Promise<IPaginateClient> {
        const query: string = `query paginateRole($page: Int, $limit: Int, $search:String) { 
            paginateRole(page: $page, limit: $limit, search: $search) { 
                total, page, limit, items{id name permissions childRoles{id name} readonly } 
            } 
        }`
        const variables = {page, limit,search}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateRole
    }


}

export default RoleGqlProvider
