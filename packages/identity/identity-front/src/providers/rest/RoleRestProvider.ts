import type {IHttpClient} from '@drax/common-front'
import type {IRoleProvider} from "../../interfaces/IRoleProvider.ts";
import type {IRole, IRoleBase} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";

class RoleRestProvider implements IRoleProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }


    async fetchPermissions(): Promise<any> {
        const url = '/api/permissions'
        let permissions = await this.httpClient.get(url)
        return permissions
    }

    async fetchRole(): Promise<any> {
        const url = '/api/roles/all'
        let role = await this.httpClient.get(url)
        return role
    }

    async create(data: IRoleBase): Promise<any> {
            const url = '/api/roles'
            let role = await this.httpClient.post(url, data)
            return role
    }
    async update(id: string, data: IRoleBase): Promise<IRole> {
        const url = '/api/roles/' + id
        let user = await this.httpClient.put(url, data)
        return user as IRole
    }

    async delete(id: string): Promise<any> {
        const url = '/api/roles/' + id
        let user = await this.httpClient.delete(url)
        return user
    }

    async paginate({page= 1, limit= 5, orderBy="", order=false, search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IRole>> {
        const url = '/api/roles'
        const params = {page, limit, orderBy, order, search}
        let paginatedRoles = await this.httpClient.get(url, {params})
        return paginatedRoles as IDraxPaginateResult<IRole>

    }


}

export default RoleRestProvider
