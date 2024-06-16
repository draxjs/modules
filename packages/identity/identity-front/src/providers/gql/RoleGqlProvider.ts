import type {IGqlClient} from '@drax/common-front'
import type {IRoleProvider, IRoleCreate} from "../../interfaces/IRoleProvider.ts";

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

    async createRole(params: IRoleCreate): Promise<any> {
        const {name, permissions, readonly} = params
        const query: string = `mutation createUser($input: UserInput) { 
        createRole(input: $input) {id name permissions readonly } 
        }`
        const variables = {input: {name, permissions, readonly}}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createUser
    }

    async fetchRole(): Promise<any> {
        const query: string = `query fetchRole { fetchRole { id name permissions readonly } }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchRole
    }
}

export default RoleGqlProvider
