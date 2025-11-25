import UserSessionSystem from "../system/UserSessionSystem.js";
import UserSessionGqlProvider from "../providers/gql/UserSessionGqlProvider.js";
import UserSessionRestClientProvider from "../providers/rest/UserSessionRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class UserSessionSystemFactory{

    static singleton: UserSessionSystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): UserSessionSystem {
        if(!UserSessionSystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new UserSessionGqlProvider(httpGqlClient)
                UserSessionSystemFactory.singleton = new UserSessionSystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new UserSessionRestClientProvider(httpRestClient)
                UserSessionSystemFactory.singleton = new UserSessionSystem(provider)
            }else{
                throw new Error('UserSessionSystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return UserSessionSystemFactory.singleton
    }

}


export default UserSessionSystemFactory
export {UserSessionSystemFactory}
