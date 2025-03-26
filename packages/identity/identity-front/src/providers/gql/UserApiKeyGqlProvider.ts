import type {IGqlClient} from '@drax/common-front'
import type {IUserApiKeyProvider} from "../../interfaces/IUserApiKeyProvider";
import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";

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

    get gqlFields(){
        return `id name secret ipv4 ipv6 createdAt updatedAt createdBy`
    }

    async search(value: any): Promise<IUserApiKey[]> {
        const query: string = `query searchUserApiKey($value: String) { searchUserApiKey(value: $value) { ${this.gqlFields} } }`
        const variables = {value}
        let data = await this.gqlClient.query(query, variables)
        return data.searchUserApiKey
    }

    async create(payload: IUserApiKeyBase): Promise<IUserApiKey> {
        const query: string = `mutation createUserApiKey($input: UserApiKeyInput) {
         createUserApiKey(input: $input) {  ${this.gqlFields}  } 
         }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createUserApiKey
    }

    async update(id: string, payload: IUserApiKeyBase): Promise<IUserApiKey> {
        const query: string = `mutation updateUserApiKey($id: ID!, $input: UserApiKeyInput) { 
        updateUserApiKey(id: $id, input: $input) {  ${this.gqlFields}  } 
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

    async paginate({page= 1, limit= 5, orderBy="", order='asc', search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>> {
        const query: string = `query paginateUserApiKey($options: PaginateOptions) { 
            paginateUserApiKey(options: $options) { 
                total page limit items{ ${this.gqlFields} } 
            } 
        }`
        const variables = {options: {page, limit, orderBy, order, search}}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateUserApiKey
    }
}

export default UserApiKeyGqlProvider
