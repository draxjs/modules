
import type {IHttpClient} from '@drax/common-front'
import type {IMediaProvider} from "../../interfaces/IMediaProvider";
import type {IMediaFile} from "../../interfaces/IMediaFile";


class MediaRestProvider implements IMediaProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }

    async uploadFile(file: File, dir: String, timeout: number = 360000): Promise<IMediaFile> {
        const url = '/api/file/'+ dir
        const data = new FormData()
        data.append('file', file)
        const response =  await this.httpClient.post(url, data, {timeout, removeHeaders: ['content-type']})
        return response as IMediaFile
    }
}

export default MediaRestProvider
export {MediaRestProvider}
