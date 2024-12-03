import RoleSystem from "../system/RoleSystem.js";
import RoleGqlProvider from "../providers/gql/RoleGqlProvider.js";
import RoleRestClientProvider from "../providers/rest/RoleRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class RoleSystemFactory{

    static singleton: RoleSystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): RoleSystem {
        if(!RoleSystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new RoleGqlProvider(httpGqlClient)
                RoleSystemFactory.singleton = new RoleSystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new RoleRestClientProvider(httpRestClient)
                RoleSystemFactory.singleton = new RoleSystem(provider)
            }else{
                throw new Error('RoleSystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return RoleSystemFactory.singleton
    }

}


export default RoleSystemFactory
export {RoleSystemFactory}
