import type {IGqlClient} from '@drax/common-front'
import type {IUserLoginFailProvider} from "../../interfaces/IUserLoginFailProvider";
import type {IUserLoginFail} from "@drax/identity-share";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";


class UserLoginFailGqlProvider implements IUserLoginFailProvider {

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
        return `_id user{_id username} agent ip createdAt`
    }



    async paginate({page= 1, limit= 5, orderBy="", order='asc', search = ""}: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserLoginFail>> {
        const query: string = `query paginateUserLoginFail($options: PaginateOptions) { 
            paginateUserLoginFail(options: $options) { 
                total, page, limit, items{ ${this.gqlFields} } 
            } 
        }`
        const variables = {options: {page, limit, orderBy, order, search}}
        let data = await this.gqlClient.query(query, variables)
        return data.paginateUserLoginFail
    }


}

export default UserLoginFailGqlProvider
