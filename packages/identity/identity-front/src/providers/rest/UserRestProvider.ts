import type {IHttpClient, IPaginateClient} from '@drax/common-front'
import type {IUserProvider} from "../../interfaces/IUserProvider.ts";
import type {IUser, IUserCreate, IUserUpdate} from "../../interfaces/IUser.ts";

class UserRestProvider implements IUserProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }

    setHttpClientToken(token: string): void {
        this.httpClient.addHeader('Authorization', `Bearer ${token}`)
    }

    removeHttpClientToken(): void {
        this.httpClient.removeHeader('Authorization')
    }

    async createUser(data: IUserCreate): Promise<IUser> {
            const url = '/api/users'
            let user = await this.httpClient.post(url, data)
            return user as IUser
    }

    async editUser(id: string, data: IUserUpdate): Promise<IUser> {
            const url = '/api/users/' + id
            let user = await this.httpClient.put(url, data)
            return user as IUser
    }

    async deleteUser(id: string): Promise<any> {
            const url = '/api/users/' + id
            let user = await this.httpClient.delete(url)
            return user
    }

    async paginateUser(page: number = 1, limit: number = 5, search:string = ""): Promise<IPaginateClient<IUser>> {
            const url = '/api/users'
            const params = {page, limit, search}
            let paginatedUsers = await this.httpClient.get(url, {params})
            return paginatedUsers as IPaginateClient<IUser>

    }

    async changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
        const url = '/api/password/' + userId
        const data = {userId, newPassword}
        let r = await this.httpClient.post(url, data)
        return /true/i.test(r as string)
    }
}

export default UserRestProvider
