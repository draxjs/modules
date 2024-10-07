import TenantSystem from "../system/TenantSystem.js";
import TenantGqlProvider from "../providers/gql/TenantGqlProvider.js";
import TenantRestClientProvider from "../providers/rest/TenantRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class TenantSystemFactory{

    static singleton: TenantSystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): TenantSystem {
        if(!TenantSystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new TenantGqlProvider(httpGqlClient)
                TenantSystemFactory.singleton = new TenantSystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new TenantRestClientProvider(httpRestClient)
                TenantSystemFactory.singleton = new TenantSystem(provider)
            }else{
                throw new Error('TenantSystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return TenantSystemFactory.singleton
    }

}


export default TenantSystemFactory
export {TenantSystemFactory}
