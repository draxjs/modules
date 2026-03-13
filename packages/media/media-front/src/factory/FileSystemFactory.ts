import {HttpGqlClientFactory, HttpRestClientFactory} from "@drax/common-front";
import FileGqlProvider from "../providers/gql/FileGqlProvider.js";
import FileRestProvider from "../providers/rest/FileRestProvider.js";
import FileSystem from "../system/FileSystem.js";

const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class FileSystemFactory {

    static singleton: FileSystem

    static getInstance(httpTransport: string = HTTP_TRANSPORT): FileSystem {
        if(!FileSystemFactory.singleton){
            if(httpTransport === 'GRAPHQL') {
                const httpGqlClient = HttpGqlClientFactory.getInstance()
                const provider = new FileGqlProvider(httpGqlClient)
                FileSystemFactory.singleton = new FileSystem(provider)
            } else if(httpTransport === 'REST') {
                const httpRestClient = HttpRestClientFactory.getInstance()
                const provider = new FileRestProvider(httpRestClient)
                FileSystemFactory.singleton = new FileSystem(provider)
            } else {
                throw new Error('FileSystemFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
            }
        }
        return FileSystemFactory.singleton
    }

}

export default FileSystemFactory
export {FileSystemFactory}
