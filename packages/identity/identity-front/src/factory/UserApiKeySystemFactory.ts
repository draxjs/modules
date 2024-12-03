import UserApiKeySystem from "../system/UserApiKeySystem.js";
import UserApiKeyGqlProvider from "../providers/gql/UserApiKeyGqlProvider.js";
import UserApiKeyRestClientProvider from "../providers/rest/UserApiKeyRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class UserApiKeySystemFactory{

    static singleton: UserApiKeySystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): UserApiKeySystem {
        if(!UserApiKeySystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new UserApiKeyGqlProvider(httpGqlClient)
                UserApiKeySystemFactory.singleton = new UserApiKeySystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new UserApiKeyRestClientProvider(httpRestClient)
                UserApiKeySystemFactory.singleton = new UserApiKeySystem(provider)
            }else{
                throw new Error('UserApiKeySystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return UserApiKeySystemFactory.singleton
    }

}


export default UserApiKeySystemFactory
export {UserApiKeySystemFactory}
