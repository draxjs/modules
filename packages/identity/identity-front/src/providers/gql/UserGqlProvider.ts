import type {IGqlClient} from '@drax/common-front'
import type {IUserProvider} from "../../interfaces/IUserProvider";
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";

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

    get gqlFields(){
        return `id username name email phone active role{id name} tenant{id name} createdAt updatedAt`
    }

    async search(value: any): Promise<IUser[]> {
        const query: string = `query searchUser($value: String) { searchUser(value: $value) { ${this.gqlFields} } }`
        const variables = {value}
        let data = await this.gqlClient.query(query, variables)
        return data.searchUser
    }

    async create(payload: IUserCreate): Promise<IUser> {
        const query: string = `mutation createUser($input: UserCreateInput) { createUser(input: $input) {  
        ${this.gqlFields}  } }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createUser
    }

    async update(id: string, payload: IUserUpdate): Promise<IUser> {
        const query: string = `mutation updateUser($id: ID!, $input: UserUpdateInput) { updateUser(id: $id, input: $input) {  
        ${this.gqlFields}  } }`
        const variables = {id, input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.updateUser
    }

    async changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
        const query: string = `mutation changeUserPassword($userId: ID!, $newPassword: String!) { changeUserPassword(userId:$userId, newPassword: $newPassword)   }`
        const variables = {userId, newPassword}
        let data = await this.gqlClient.mutation(query, variables)
        return data.changeUserPassword
    }

    async delete(id: string): Promise<any> {
        const query: string = `mutation deleteUser($id: ID!) { deleteUser(id: $id) }`
        const variables = {id: id}
        let data = await this.gqlClient.mutation(query, variables)
        return data.deleteUser
    }

    async paginate({page= 1, limit= 5, orderBy="", order='asc', search = ""}:IDraxPaginateOptions): Promise<IDraxPaginateResult<IUser>> {
        const query: string = `query paginateUser($options: PaginateOptions) { 
            paginateUser(options: $options) { 
                total page limit items{ ${this.gqlFields} createdAt updatedAt } 
            } 
        }`
        const variables = {options: {page, limit, orderBy, order, search}}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateUser
    }
}

export default UserGqlProvider
