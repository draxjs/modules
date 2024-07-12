import type {IHttpClient} from '@drax/common-front'
import type {IUserProvider} from "../../interfaces/IUserProvider.ts";
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IDraxPaginateResult} from "@drax/common-share";


class UserRestProvider implements IUserProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }


    async create(data: IUserCreate): Promise<IUser> {
            const url = '/api/users'
            let user = await this.httpClient.post(url, data)
            return user as IUser
    }

    async update(id: string, data: IUserUpdate): Promise<IUser> {
            const url = '/api/users/' + id
            let user = await this.httpClient.put(url, data)
            return user as IUser
    }

    async delete(id: string): Promise<any> {
            const url = '/api/users/' + id
            let user = await this.httpClient.delete(url)
            return user
    }

    async paginate({page= 1, limit= 5, orderBy="", orderDesc=false, search = ""}): Promise<IDraxPaginateResult<IUser>> {
        const url = '/api/users'
        const params = {page, limit, orderBy, orderDesc, search}
            let paginatedUsers = await this.httpClient.get(url, {params})
            return paginatedUsers as IDraxPaginateResult<IUser>

    }

    async changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
        const url = '/api/password/' + userId
        const data = {userId, newPassword}
        let r = await this.httpClient.post(url, data)
        return /true/i.test(r as string)
    }


}

export default UserRestProvider
