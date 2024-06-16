import type {IGqlClient} from '@drax/common-front'
import type {IUserProvider, IUserCreate} from "../../interfaces/IUserProvider.ts";

class UserGqlProvider implements IUserProvider {

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

    async createUser(params: IUserCreate): Promise<any> {
        const {username, email, password, role} = params
        const query: string = `mutation createUser($input: UserInput) { createUser(input: $input) {  
        id username name email role phone } }`
        const variables = {input: {username, name, email, password, role}}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createUser
    }

    async paginateUser(page: number, limit: number): Promise<any> {
        const query: string = `query paginateUser { paginateUser { total, page, limit, items{id, username, email, active, role{id, name} } } }`
        const variables = {page, limit}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateUser
    }
}

export default UserGqlProvider
