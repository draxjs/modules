import type {IGqlClientInterface, IHttpClientInterface} from '@drax/common-front'
import {HttpFetchClientFactory} from '@drax/common-front';
import type {IAuthProviderInterface} from "@/core/interfaces/IAuthProviderInterface";
import AuthRestProvider from "@/core/providers/gql/AuthGqlProvider";
import AuthGqlProvider from "@/core/providers/gql/AuthGqlProvider";
class AuthProviderFactory{
    static create(type: string = 'rest'): IAuthProviderInterface {
        if (type === 'gql') {
            return AuthProviderFactory.createGql()
        }
        return AuthProviderFactory.createRest()
    }

    static createGql(): IAuthProviderInterface {
        const gqlClient: IGqlClientInterface = null
        return new AuthGqlProvider(gqlClient)
    }

    static createRest(): IAuthProviderInterface {
        const baseUrl = process.env.VUE_APP_BACKEND_URL ? process.env.VUE_APP_BACKEND_URL : ''
        const baseHeaders = new Headers()
        const httpClient: IHttpClientInterface = HttpFetchClientFactory.create(baseUrl,baseHeaders)
        return new AuthRestProvider(httpClient)
    }
}

export default AuthProviderFactory
export {AuthProviderFactory}
