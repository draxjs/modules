import type {IGqlClient, IHttpClient} from '@drax/common-front'
import {HttpGqlClientFactory, HttpFetchClientFactory} from '@drax/common-front';
import type {IAuthProvider} from "@/core/interfaces/IAuthProvider";
import AuthRestProvider from "@/core/providers/rest/AuthRestProvider";
import AuthGqlProvider from "@/core/providers/gql/AuthGqlProvider";
class AuthProviderFactory{
    static create(type: string = 'rest'): IAuthProvider {
        if (type === 'gql') {
            return AuthProviderFactory.createGql()
        }
        return AuthProviderFactory.createRest()
    }

    static createGql(): IAuthProvider {
        const gqlClient: IGqlClient = HttpGqlClientFactory.create('/graphql')
        return new AuthGqlProvider(gqlClient)
    }

    static createRest(): IAuthProvider {
        const baseUrl = import.meta.env.API_URL ? import.meta.env.API_URL : ''
        console.log("baseUrl",baseUrl)
        const baseHeaders = new Headers()
        const httpClient: IHttpClient = HttpFetchClientFactory.create(baseUrl,baseHeaders)
        return new AuthRestProvider(httpClient)
    }
}

export default AuthProviderFactory
export {AuthProviderFactory}
