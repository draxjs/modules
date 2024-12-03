import MediaSystem from "../system/MediaSystem.js";
import MediaGqlProvider from "../providers/gql/MediaGqlProvider.js";
import MediaRestClientProvider from "../providers/rest/MediaRestProvider.js";
import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front"
const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class MediaSystemFactory{

    static singleton: MediaSystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): MediaSystem {
        if(!MediaSystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new MediaGqlProvider(httpGqlClient)
                MediaSystemFactory.singleton = new MediaSystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new MediaRestClientProvider(httpRestClient)
                MediaSystemFactory.singleton = new MediaSystem(provider)
            }else{
                throw new Error('MediaSystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return MediaSystemFactory.singleton
    }

}


export default MediaSystemFactory
export {MediaSystemFactory}
