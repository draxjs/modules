import type {IGqlClientInterface, IHttpClientInterface} from '@drax/common-front'
import {GqlApolloClientFactory, HttpFetchClientFactory} from '@drax/common-front';
import type {IAuthProviderInterface} from "@/core/interfaces/IAuthProviderInterface";
import AuthRestProvider from "@/core/providers/rest/AuthRestProvider";
import AuthGqlProvider from "@/core/providers/gql/AuthGqlProvider";
class AuthProviderFactory{
    static create(type: string = 'rest'): IAuthProviderInterface {
        if (type === 'gql') {
            return AuthProviderFactory.createGql()
        }
        return AuthProviderFactory.createRest()
    }

    static createGql(): IAuthProviderInterface {
        const gqlClient: IGqlClientInterface = GqlApolloClientFactory.create('/graphql')
        return new AuthGqlProvider(gqlClient)
    }

    static createRest(): IAuthProviderInterface {
        const baseUrl = import.meta.env.API_URL ? import.meta.env.API_URL : ''
        console.log("baseUrl",baseUrl)
        const baseHeaders = new Headers()
        const httpClient: IHttpClientInterface = HttpFetchClientFactory.create(baseUrl,baseHeaders)
        return new AuthRestProvider(httpClient)
    }
}

export default AuthProviderFactory
export {AuthProviderFactory}
