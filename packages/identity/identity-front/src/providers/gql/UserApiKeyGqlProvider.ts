import type {IGqlClient} from '@drax/common-front'
import type {IUserApiKeyProvider} from "../../interfaces/IUserApiKeyProvider";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxPaginateResult} from "@drax/common-share";

class UserApiKeyGqlProvider implements IUserApiKeyProvider {

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

    async create(payload: IUserApiKeyBase): Promise<IUserApiKey> {
        const query: string = `mutation createUserApiKey($input: UserApiKeyInput) {
         createUserApiKey(input: $input) {  id name secret ipv4 ipv6 createdAt updatedAt  } 
         }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createUserApiKey
    }

    async update(id: string, payload: IUserApiKeyBase): Promise<IUserApiKey> {
        const query: string = `mutation updateUserApiKey($id: ID!, $input: UserApiKeyInput) { 
        updateUserApiKey(id: $id, input: $input) {  id name ipv4 ipv6 createdAt updatedAt  } 
        }`
        const variables = {id, input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.updateUserApiKey
    }



    async delete(id: string): Promise<any> {
        const query: string = `mutation deleteUserApiKey($id: ID!) { 
        deleteUserApiKey(id: $id) 
        }`
        const variables = {id: id}
        let data = await this.gqlClient.mutation(query, variables)
        return data.deleteUserApiKey
    }

    async paginate({page= 1, limit= 5, orderBy="", orderDesc=false, search = ""}): Promise<IDraxPaginateResult<IUserApiKey>> {
        const query: string = `query paginateUserApiKey($options: PaginateOptions) { 
            paginateUserApiKey(options: $options) { 
                total page limit items{ id name ipv4 ipv6 user{id username} createdAt updatedAt } 
            } 
        }`
        const variables = {options: {page, limit, orderBy, orderDesc, search}}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateUserApiKey
    }
}

export default UserApiKeyGqlProvider
