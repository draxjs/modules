import AuthSystem from "../system/AuthSystem.js";
import AuthGqlProvider from "../providers/gql/AuthGqlProvider.js";
import AuthRestClientProvider from "../providers/rest/AuthRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';
class AuthSystemFactory{

    static singleton: AuthSystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): AuthSystem {
        if(!AuthSystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new AuthGqlProvider(httpGqlClient)
                AuthSystemFactory.singleton = new AuthSystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new AuthRestClientProvider(httpRestClient)
                AuthSystemFactory.singleton = new AuthSystem(provider)
            }else{
                throw new Error('AuthSystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return AuthSystemFactory.singleton
    }

}


export default AuthSystemFactory
export {AuthSystemFactory}
