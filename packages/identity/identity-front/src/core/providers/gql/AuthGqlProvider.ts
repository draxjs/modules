import type {IGqlClientInterface} from '@drax/common-front'
import type {IAuthProviderInterface} from "@/core/interfaces/IAuthProviderInterface";
class AuthGqlProvider implements IAuthProviderInterface{

    gqlClient : IGqlClientInterface
    constructor(gqlClient: IGqlClientInterface) {
        this.gqlClient = gqlClient
    }
    async login(username: string, password: string): Promise<string> {

        const url = null
        const data = {username, password}
        let r = this.gqlClient.mutation(url, data)

        return r
    }
}

export default AuthGqlProvider
