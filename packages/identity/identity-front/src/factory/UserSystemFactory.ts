import UserSystem from "../system/UserSystem.js";
import UserGqlProvider from "../providers/gql/UserGqlProvider.js";
import UserRestClientProvider from "../providers/rest/UserRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class UserSystemFactory{

    static singleton: UserSystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): UserSystem {
        if(!UserSystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new UserGqlProvider(httpGqlClient)
                UserSystemFactory.singleton = new UserSystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new UserRestClientProvider(httpRestClient)
                UserSystemFactory.singleton = new UserSystem(provider)
            }else{
                throw new Error('UserSystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return UserSystemFactory.singleton
    }

}


export default UserSystemFactory
export {UserSystemFactory}
