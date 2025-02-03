import SettingGqlProvider from "../providers/gql/SettingGqlProvider.js";
import SettingRestClientProvider from "../providers/rest/SettingRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
import type {ISettingProvider} from "../interfaces/ISettingProvider";

const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class SettingProviderFactory{

    static singleton: ISettingProvider

    static getInstance(httpTransport: string = HTTP_TRANSPORT): ISettingProvider {
        if(!SettingProviderFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                SettingProviderFactory.singleton = new SettingGqlProvider(httpGqlClient)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                SettingProviderFactory.singleton = new SettingRestClientProvider(httpRestClient)
            }else{
                throw new Error('SettingProviderFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return SettingProviderFactory.singleton
    }

}


export default SettingProviderFactory
export {SettingProviderFactory}
