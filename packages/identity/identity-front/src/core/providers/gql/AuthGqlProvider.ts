import type {IGqlClientInterface} from '@drax/common-front'
import type {IAuthProvider} from "../../interfaces/IAuthProvider.ts";
class AuthGqlProvider implements IAuthProvider{

    gqlClient : IGqlClientInterface
    constructor(gqlClient: IGqlClientInterface) {
        this.gqlClient = gqlClient
    }
    async login(username: string, password: string): Promise<object> {

        const url : string = ''
        const data = {username, password}
        let r = this.gqlClient.mutation(url, data)

        return r
    }
}

export default AuthGqlProvider
