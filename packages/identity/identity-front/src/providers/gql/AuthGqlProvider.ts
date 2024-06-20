import type {IGqlClient} from '@drax/common-front'
import type {IAuthProvider} from "../../interfaces/IAuthProvider.ts";
import type {IAuthUser} from "../../interfaces/IAuthUser";
import type {ILoginResponse} from "../../interfaces/ILoginResponse";

class AuthGqlProvider implements IAuthProvider {

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

    logout(): void {
        this.removeHttpClientToken()
    }

    async login(username: string, password: string): Promise<ILoginResponse> {

        const query: string = `mutation auth($input: AuthInput) { auth(input: $input) {accessToken} }`
        const variables = {input: {username, password}}
        let data = await this.gqlClient.mutation(query, variables)
        const {accessToken} = data.auth
        this.setHttpClientToken(accessToken)
        return {accessToken}
    }

    async me(): Promise<IAuthUser> {
        const query: string = `query me { me {id,username, email, role {id, name}} }`
        let data = await this.gqlClient.query(query)
        return data.me
    }
}

export default AuthGqlProvider
