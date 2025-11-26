import UserLoginFailSystem from "../system/UserLoginFailSystem.js";
import UserLoginFailGqlProvider from "../providers/gql/UserLoginFailGqlProvider.js";
import UserLoginFailRestClientProvider from "../providers/rest/UserLoginFailRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class UserLoginFailSystemFactory{

    static singleton: UserLoginFailSystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): UserLoginFailSystem {
        if(!UserLoginFailSystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new UserLoginFailGqlProvider(httpGqlClient)
                UserLoginFailSystemFactory.singleton = new UserLoginFailSystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new UserLoginFailRestClientProvider(httpRestClient)
                UserLoginFailSystemFactory.singleton = new UserLoginFailSystem(provider)
            }else{
                throw new Error('UserLoginFailSystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return UserLoginFailSystemFactory.singleton
    }

}


export default UserLoginFailSystemFactory
export {UserLoginFailSystemFactory}
