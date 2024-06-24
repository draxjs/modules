import type {IGqlClient, IPaginateClient} from '@drax/common-front'
import type {IUserProvider} from "../../interfaces/IUserProvider";
import type {IUser, IUserCreate, IUserUpdate} from "../../interfaces/IUser";

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

    async createUser(payload: IUserCreate): Promise<IUser> {
        const query: string = `mutation createUser($input: UserCreateInput) { createUser(input: $input) {  
        id username name email phone active role{id name} tenant{id name}  } }`
        const variables = {input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createUser
    }

    async editUser(id: string, payload: IUserUpdate): Promise<IUser> {
        const query: string = `mutation updateUser($id: ID!, $input: UserUpdateInput) { updateUser(id: $id, input: $input) {  
        id username name email phone active role{id name} tenant{id name}  } }`
        const variables = {id, input: payload}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createUser
    }

    async changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
        const query: string = `mutation changeUserPassword($userId: ID!, $newPassword: String!) { changeUserPassword(userId:$userId, newPassword: $newPassword)   }`
        const variables = {userId, newPassword}
        let data = await this.gqlClient.mutation(query, variables)
        return data.changeUserPassword
    }

    async deleteUser(id: string): Promise<any> {
        const query: string = `mutation deleteUser($id: ID!) { deleteUser(id: $id) }`
        const variables = {id: id}
        let data = await this.gqlClient.mutation(query, variables)
        return data.createUser
    }

    async paginateUser(page: number, limit: number, search:string = ""): Promise<IPaginateClient<IUser>> {
        const query: string = `query paginateUser($page: Int, $limit: Int, $search:String) { 
            paginateUser(page: $page, limit: $limit, search: $search) { 
                total, page, limit, items{ id, name username, email, phone, active, role{id, name} tenant{id name} } 
            } 
        }`
        const variables = {page, limit, search}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateUser
    }
}

export default UserGqlProvider
