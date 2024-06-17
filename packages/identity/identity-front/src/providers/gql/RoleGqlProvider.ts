import type {IGqlClient} from '@drax/common-front'
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

    async createRole(payload: IRole): Promise<any> {
        const query: string = `mutation createRole($input: UserInput) { 
        createRole(input: $input) {id name permissions readonly } 
        }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createRole
    }

    async fetchRole(): Promise<any> {
        const query: string = `query fetchRole { fetchRole { id name permissions readonly } }`
        const variables = {}
        let data = await this.gqlClient.query(query, variables)
        return data.fetchRole
    }
}

export default RoleGqlProvider
